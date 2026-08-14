import { describe, expect, it } from 'vitest';
import { buildDownloadArgs, buildProbeArgs } from './args';

describe('buildDownloadArgs', () => {
  it('builds best-video args for a public single video', () => {
    const args = buildDownloadArgs({
      url: 'https://example.com/watch/abc123',
      outputDir: '/Users/example/Movies',
      quality: 'best',
      playlist: false,
      subtitles: false,
      useBrowserCookies: false,
      browser: 'chrome',
      ffmpegPath: '/opt/tools/ffmpeg'
    });

    expect(args).toContain('--no-playlist');
    expect(args).toContain('--ffmpeg-location');
    expect(args).toContain('/opt/tools/ffmpeg');
    expect(args).toContain('--merge-output-format');
    expect(args).toContain('mp4/mkv');
    expect(args).toContain('bv*+ba/b');
    expect(args).not.toContain('--cookies-from-browser');
    expect(args.at(-1)).toBe('https://example.com/watch/abc123');
  });

  it('sorts by resolution first so best means highest resolution', () => {
    const args = buildDownloadArgs({
      url: 'https://example.com/watch/abc123',
      outputDir: '/Users/example/Movies',
      quality: 'best',
      playlist: false,
      subtitles: false,
      useBrowserCookies: false,
      browser: 'chrome',
      ffmpegPath: '/opt/tools/ffmpeg'
    });

    expect(args[args.indexOf('-S') + 1]).toBe('res,fps,hdr:12,vcodec');
  });

  it('applies Windows filename mangling only on Windows', () => {
    const request = {
      url: 'https://example.com/watch/abc123',
      outputDir: '/Users/example/Movies',
      quality: 'best',
      playlist: false,
      subtitles: false,
      useBrowserCookies: false,
      browser: 'chrome',
      ffmpegPath: '/opt/tools/ffmpeg'
    } as const;

    expect(buildDownloadArgs(request, 'win32')).toContain('--windows-filenames');
    expect(buildDownloadArgs(request, 'darwin')).not.toContain('--windows-filenames');
    expect(buildDownloadArgs(request, 'darwin')).not.toContain('--restrict-filenames');
  });

  it('caps video height and enables browser cookies when requested', () => {
    const args = buildDownloadArgs({
      url: 'https://media.example.org/posts/example',
      outputDir: 'D:\\Clips',
      quality: '1080',
      playlist: true,
      subtitles: true,
      useBrowserCookies: true,
      browser: 'edge',
      ffmpegPath: 'C:\\Tools\\ffmpeg.exe'
    });

    expect(args).toContain('--yes-playlist');
    expect(args).toContain('--cookies-from-browser');
    expect(args).toContain('edge');
    expect(args).toContain('bv*[height<=1080]+ba/b[height<=1080]/best[height<=1080]');
    expect(args).toContain('--write-subs');
    expect(args).toContain('--write-auto-subs');
    expect(args).toContain('--convert-subs');
    expect(args).toContain('srt');
  });

  it('uses extraction flags for audio-only downloads', () => {
    const args = buildDownloadArgs({
      url: 'https://video.example.net/abc123',
      outputDir: '/Users/example/Music',
      quality: 'audio',
      playlist: false,
      subtitles: false,
      useBrowserCookies: false,
      browser: 'chrome',
      ffmpegPath: '/opt/tools/ffmpeg'
    });

    expect(args).toContain('-x');
    expect(args).toContain('--audio-format');
    expect(args).toContain('mp3');
    expect(args).not.toContain('--merge-output-format');
  });

  it('selects an audio-only format so no video stream is fetched', () => {
    const args = buildDownloadArgs({
      url: 'https://video.example.net/abc123',
      outputDir: '/Users/example/Music',
      quality: 'audio',
      playlist: false,
      subtitles: false,
      useBrowserCookies: false,
      browser: 'chrome',
      ffmpegPath: '/opt/tools/ffmpeg'
    });

    expect(args[args.indexOf('-f') + 1]).toBe('ba/b');
  });

  it('passes a JS runtime to yt-dlp when one is available', () => {
    const request = {
      url: 'https://example.com/watch/abc123',
      outputDir: '/Users/example/Movies',
      quality: 'best',
      playlist: false,
      subtitles: false,
      useBrowserCookies: false,
      browser: 'chrome',
      ffmpegPath: '/opt/tools/ffmpeg',
      jsRuntimePath: '/Users/example/Library/Application Support/vd/tools/node-shim'
    } as const;

    const downloadArgs = buildDownloadArgs(request);
    expect(downloadArgs[downloadArgs.indexOf('--js-runtimes') + 1]).toBe(
      'node:/Users/example/Library/Application Support/vd/tools/node-shim'
    );

    const probeArgs = buildProbeArgs(request);
    expect(probeArgs).toContain('--js-runtimes');
  });

  it('omits the JS runtime flag when no runtime could be prepared', () => {
    const args = buildDownloadArgs({
      url: 'https://example.com/watch/abc123',
      outputDir: '/Users/example/Movies',
      quality: 'best',
      playlist: false,
      subtitles: false,
      useBrowserCookies: false,
      browser: 'chrome',
      ffmpegPath: '/opt/tools/ffmpeg',
      jsRuntimePath: null
    });

    expect(args).not.toContain('--js-runtimes');
  });

  it('keeps the original codec for original-quality audio downloads', () => {
    const args = buildDownloadArgs({
      url: 'https://video.example.net/abc123',
      outputDir: '/Users/example/Music',
      quality: 'audio-best',
      playlist: false,
      subtitles: false,
      useBrowserCookies: false,
      browser: 'chrome',
      ffmpegPath: '/opt/tools/ffmpeg'
    });

    expect(args[args.indexOf('--audio-format') + 1]).toBe('best');
    expect(args).not.toContain('--audio-quality');
  });
});
