import type { DownloadRequest } from '../../shared/types';

const outputTemplate = '%(title).200B [%(id)s].%(ext)s';

export function buildDownloadArgs(request: DownloadRequest, platform: NodeJS.Platform = process.platform): string[] {
  const args = ['--newline', '--ignore-config', '--no-mtime'];

  // Only Windows needs the reserved-character mangling; on macOS and Linux it
  // just makes filenames uglier than they need to be.
  if (platform === 'win32') {
    args.push('--windows-filenames', '--restrict-filenames');
  }

  args.push('--paths', request.outputDir, '-o', outputTemplate, '--ffmpeg-location', request.ffmpegPath);
  args.push(request.playlist ? '--yes-playlist' : '--no-playlist');

  if (request.jsRuntimePath) {
    args.push('--js-runtimes', `node:${request.jsRuntimePath}`);
  }

  if (request.useBrowserCookies) {
    args.push('--cookies-from-browser', request.browser);
  }

  if (request.subtitles) {
    args.push('--write-subs', '--write-auto-subs', '--sub-langs', 'en.*,en', '--convert-subs', 'srt');
  }

  if (isAudioOnly(request.quality)) {
    // `-x` alone leaves the default video+audio selection in place, which would
    // pull the whole video stream down just to discard it. `-f ba/b` avoids that.
    args.push('-f', 'ba/b', '-x');
    args.push('--audio-format', request.quality === 'audio' ? 'mp3' : 'best');

    if (request.quality === 'audio') {
      args.push('--audio-quality', '0');
    }
  } else {
    args.push('-f', formatSelectorFor(request.quality));

    if (request.quality === 'best') {
      // Sort resolution first so "Best" always means highest pixel count, then
      // fall through to yt-dlp's default tie-breakers.
      args.push('-S', 'res,fps,hdr:12,vcodec');
    }

    // Prefer mp4 for native macOS playback, but fall back to mkv when the
    // highest-resolution streams (VP9/AV1 + Opus) cannot be remuxed into mp4.
    args.push('--merge-output-format', 'mp4/mkv');
  }

  args.push(request.url);
  return args;
}

export function buildProbeArgs(request: Omit<DownloadRequest, 'ffmpegPath'>): string[] {
  const args = ['--ignore-config', '--dump-json', '--skip-download', '--no-warnings'];
  args.push(request.playlist ? '--yes-playlist' : '--no-playlist');

  if (request.jsRuntimePath) {
    args.push('--js-runtimes', `node:${request.jsRuntimePath}`);
  }

  if (request.useBrowserCookies) {
    args.push('--cookies-from-browser', request.browser);
  }

  args.push(request.url);
  return args;
}

function isAudioOnly(quality: DownloadRequest['quality']): boolean {
  return quality === 'audio' || quality === 'audio-best';
}

function formatSelectorFor(quality: DownloadRequest['quality']): string {
  if (quality === 'best') {
    // Highest resolution that editors handle natively. Above 1080p most sites
    // only publish VP9/AV1, which import badly into Final Cut and Premiere, so
    // prefer H.264 + AAC and only fall back to other codecs when a site offers
    // nothing else.
    return 'bv*[vcodec^=avc1]+ba[acodec^=mp4a]/bv*[vcodec^=avc1]+ba/b[vcodec^=avc1]/bv*+ba/b';
  }

  return `bv*[height<=${quality}]+ba/b[height<=${quality}]/best[height<=${quality}]`;
}
