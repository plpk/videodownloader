import { createWriteStream } from 'node:fs';
import { access, chmod, mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { get } from 'node:https';
import { dirname, join } from 'node:path';
import ffmpegStatic from 'ffmpeg-static';
import type { ToolStatus } from '../../shared/types';

const releaseBaseUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download';

type DownloadFile = (url: string, destination: string) => Promise<void>;

interface EnsureYtDlpOptions {
  force?: boolean;
  downloadFile?: DownloadFile;
}

/**
 * yt-dlp publishes one standalone build per platform. The macOS asset is a
 * universal2 binary (Intel + Apple silicon) and needs macOS 12 or newer.
 */
export function getYtDlpAssetName(platform: NodeJS.Platform = process.platform, arch: string = process.arch): string {
  if (platform === 'win32') {
    return 'yt-dlp.exe';
  }

  if (platform === 'darwin') {
    return 'yt-dlp_macos';
  }

  return arch === 'arm64' ? 'yt-dlp_linux_aarch64' : 'yt-dlp_linux';
}

export function getToolsDir(userDataDir: string): string {
  return join(userDataDir, 'tools');
}

export function getYtDlpPath(userDataDir: string): string {
  return join(getToolsDir(userDataDir), getYtDlpAssetName());
}

export function getFfmpegPath(): string | null {
  if (!ffmpegStatic) {
    return null;
  }

  return ffmpegStatic.replace('app.asar', 'app.asar.unpacked');
}

export function getJsRuntimeShimPath(userDataDir: string): string {
  const name = process.platform === 'win32' ? 'node-shim.cmd' : 'node-shim';
  return join(getToolsDir(userDataDir), name);
}

/**
 * yt-dlp needs a JavaScript runtime (Node >= 22 or Deno >= 2.3) to solve
 * YouTube's signature challenges; without one it warns that "some formats may
 * be missing", which can silently cap the resolution we are able to fetch.
 *
 * Electron already embeds a modern Node, and ELECTRON_RUN_AS_NODE makes the
 * app's own binary behave exactly like `node`. Writing a tiny shim that sets
 * that variable gives yt-dlp a supported runtime with no extra download.
 *
 * The shim is rewritten on every call because process.execPath changes when the
 * app is moved, renamed, or upgraded.
 */
export async function ensureJsRuntimeShim(
  userDataDir: string,
  electronPath: string = process.execPath
): Promise<string | null> {
  const shimPath = getJsRuntimeShimPath(userDataDir);

  try {
    await mkdir(dirname(shimPath), { recursive: true });

    if (process.platform === 'win32') {
      await writeFile(shimPath, `@echo off\r\nset ELECTRON_RUN_AS_NODE=1\r\n"${electronPath}" %*\r\n`, 'utf8');
    } else {
      await writeFile(shimPath, `#!/bin/sh\nELECTRON_RUN_AS_NODE=1 exec "${electronPath}" "$@"\n`, 'utf8');
      await chmod(shimPath, 0o755);
    }

    return shimPath;
  } catch {
    // A missing runtime degrades quality but never blocks a download, so this
    // stays non-fatal and is surfaced through getToolStatus instead.
    return null;
  }
}

export async function getToolStatus(userDataDir: string): Promise<ToolStatus> {
  const ytDlpPath = getYtDlpPath(userDataDir);
  const jsRuntimePath = getJsRuntimeShimPath(userDataDir);

  return {
    ytDlpInstalled: await fileExists(ytDlpPath),
    ytDlpPath,
    ffmpegPath: getFfmpegPath(),
    jsRuntimePath: (await fileExists(jsRuntimePath)) ? jsRuntimePath : null
  };
}

export async function ensureYtDlp(userDataDir: string, options: EnsureYtDlpOptions = {}): Promise<string> {
  const ytDlpPath = getYtDlpPath(userDataDir);

  if (!options.force && (await fileExists(ytDlpPath))) {
    return ytDlpPath;
  }

  await mkdir(dirname(ytDlpPath), { recursive: true });
  const tempPath = `${ytDlpPath}.download`;
  await rm(tempPath, { force: true });
  await (options.downloadFile ?? downloadFile)(`${releaseBaseUrl}/${getYtDlpAssetName()}`, tempPath);

  // Windows infers executability from the extension; every other platform needs
  // the bit set explicitly or spawn() fails with EACCES.
  if (process.platform !== 'win32') {
    await chmod(tempPath, 0o755);
  }

  await rm(ytDlpPath, { force: true });
  await rename(tempPath, ytDlpPath);
  return ytDlpPath;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function downloadFile(url: string, destination: string, redirectCount = 0): Promise<void> {
  if (redirectCount > 5) {
    throw new Error('Too many redirects while downloading the download tool.');
  }

  await new Promise<void>((resolve, reject) => {
    const request = get(url, (response) => {
      const status = response.statusCode ?? 0;
      const location = response.headers.location;

      if (status >= 300 && status < 400 && location) {
        response.resume();
        downloadFile(new URL(location, url).toString(), destination, redirectCount + 1).then(resolve, reject);
        return;
      }

      if (status < 200 || status >= 300) {
        response.resume();
        reject(new Error(`Could not download the download tool. HTTP ${status}.`));
        return;
      }

      const file = createWriteStream(destination);
      response.pipe(file);
      file.on('finish', () => {
        file.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
      file.on('error', reject);
    });

    request.on('error', reject);
  });
}
