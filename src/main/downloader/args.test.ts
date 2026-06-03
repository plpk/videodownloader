import { describe, expect, it } from 'vitest';
import { buildDownloadArgs } from './args';

describe('buildDownloadArgs', () => {
  it('builds best-video args for a public single video', () => {
    const args = buildDownloadArgs({
      url: 'https://www.youtube.com/watch?v=abc123',
      outputDir: 'C:\\Videos',
      quality: 'best',
      playlist: false,
      subtitles: false,
      useBrowserCookies: false,
      browser: 'chrome',
      ffmpegPath: 'C:\\Tools\\ffmpeg.exe'
    });

    expect(args).toContain('--no-playlist');
    expect(args).toContain('--ffmpeg-location');
    expect(args).toContain('C:\\Tools\\ffmpeg.exe');
    expect(args).toContain('--merge-output-format');
    expect(args).toContain('mp4');
    expect(args).toContain('bv*+ba/b');
    expect(args).not.toContain('--cookies-from-browser');
    expect(args.at(-1)).toBe('https://www.youtube.com/watch?v=abc123');
  });

  it('caps video height and enables browser cookies when requested', () => {
    const args = buildDownloadArgs({
      url: 'https://www.linkedin.com/posts/example',
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
      url: 'https://youtu.be/abc123',
      outputDir: 'C:\\Audio',
      quality: 'audio',
      playlist: false,
      subtitles: false,
      useBrowserCookies: false,
      browser: 'chrome',
      ffmpegPath: 'C:\\Tools\\ffmpeg.exe'
    });

    expect(args).toContain('-x');
    expect(args).toContain('--audio-format');
    expect(args).toContain('mp3');
    expect(args).not.toContain('--merge-output-format');
  });
});
