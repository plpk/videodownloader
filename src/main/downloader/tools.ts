import { createWriteStream } from 'node:fs';
import { access, mkdir, rename, rm } from 'node:fs/promises';
import { get } from 'node:https';
import { dirname, join } from 'node:path';
import ffmpegStatic from 'ffmpeg-static';
import type { ToolStatus } from '../../shared/types';

const ytDlpDownloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';

type DownloadFile = (url: string, destination: string) => Promise<void>;

interface EnsureYtDlpOptions {
  force?: boolean;
  downloadFile?: DownloadFile;
}

export function getToolsDir(userDataDir: string): string {
  return join(userDataDir, 'tools');
}

export function getYtDlpPath(userDataDir: string): string {
  return join(getToolsDir(userDataDir), 'yt-dlp.exe');
}

export function getFfmpegPath(): string | null {
  if (!ffmpegStatic) {
    return null;
  }

  return ffmpegStatic.replace('app.asar', 'app.asar.unpacked');
}

export async function getToolStatus(userDataDir: string): Promise<ToolStatus> {
  const ytDlpPath = getYtDlpPath(userDataDir);

  return {
    ytDlpInstalled: await fileExists(ytDlpPath),
    ytDlpPath,
    ffmpegPath: getFfmpegPath()
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
  await (options.downloadFile ?? downloadFile)(ytDlpDownloadUrl, tempPath);
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
