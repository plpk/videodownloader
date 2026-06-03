import type { DownloadRequest } from '../../shared/types';

const outputTemplate = '%(title).200B [%(id)s].%(ext)s';

export function buildDownloadArgs(request: DownloadRequest): string[] {
  const args = [
    '--newline',
    '--ignore-config',
    '--no-mtime',
    '--windows-filenames',
    '--restrict-filenames',
    '--paths',
    request.outputDir,
    '-o',
    outputTemplate,
    '--ffmpeg-location',
    request.ffmpegPath
  ];

  args.push(request.playlist ? '--yes-playlist' : '--no-playlist');

  if (request.useBrowserCookies) {
    args.push('--cookies-from-browser', request.browser);
  }

  if (request.subtitles) {
    args.push('--write-subs', '--write-auto-subs', '--sub-langs', 'en.*,en', '--convert-subs', 'srt');
  }

  if (request.quality === 'audio') {
    args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
  } else {
    args.push('-f', formatSelectorFor(request.quality), '--merge-output-format', 'mp4');
  }

  args.push(request.url);
  return args;
}

export function buildProbeArgs(request: Omit<DownloadRequest, 'ffmpegPath'>): string[] {
  const args = ['--ignore-config', '--dump-json', '--skip-download', '--no-warnings'];
  args.push(request.playlist ? '--yes-playlist' : '--no-playlist');

  if (request.useBrowserCookies) {
    args.push('--cookies-from-browser', request.browser);
  }

  args.push(request.url);
  return args;
}

function formatSelectorFor(quality: DownloadRequest['quality']): string {
  if (quality === 'best') {
    return 'bv*+ba/b';
  }

  return `bv*[height<=${quality}]+ba/b[height<=${quality}]/best[height<=${quality}]`;
}
