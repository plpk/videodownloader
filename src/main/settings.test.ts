import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it } from 'vitest';
import { loadSettings, saveSettings } from './settings';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
  tempDirs.length = 0;
});

describe('settings persistence', () => {
  it('uses safe defaults when no settings file exists', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'video-downloader-settings-'));
    tempDirs.push(dir);

    const settings = await loadSettings(dir);

    expect(settings).toMatchObject({
      quality: 'best',
      playlist: false,
      subtitles: false,
      useBrowserCookies: false,
      browser: 'chrome'
    });
    expect(settings.outputDir).toContain('Downloads');
  });

  it('round-trips saved settings', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'video-downloader-settings-'));
    tempDirs.push(dir);

    await saveSettings(dir, {
      outputDir: 'D:\\Clips',
      quality: '720',
      playlist: true,
      subtitles: true,
      useBrowserCookies: true,
      browser: 'edge'
    });

    await expect(loadSettings(dir)).resolves.toEqual({
      outputDir: 'D:\\Clips',
      quality: '720',
      playlist: true,
      subtitles: true,
      useBrowserCookies: true,
      browser: 'edge'
    });
  });
});
