import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { AppSettings } from '../shared/types';

const settingsFileName = 'settings.json';

export function defaultSettings(): AppSettings {
  return {
    outputDir: join(homedir(), 'Downloads'),
    quality: 'best',
    playlist: false,
    subtitles: false,
    useBrowserCookies: false,
    browser: 'chrome'
  };
}

export async function loadSettings(userDataDir: string): Promise<AppSettings> {
  try {
    const raw = await readFile(join(userDataDir, settingsFileName), 'utf8');
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return normalizeSettings(parsed);
  } catch {
    return defaultSettings();
  }
}

export async function saveSettings(userDataDir: string, settings: AppSettings): Promise<AppSettings> {
  const normalized = normalizeSettings(settings);
  await mkdir(userDataDir, { recursive: true });
  await writeFile(join(userDataDir, settingsFileName), JSON.stringify(normalized, null, 2), 'utf8');
  return normalized;
}

function normalizeSettings(settings: Partial<AppSettings>): AppSettings {
  const defaults = defaultSettings();
  const quality = ['best', '2160', '1440', '1080', '720', '480', 'audio'].includes(settings.quality ?? '')
    ? settings.quality
    : defaults.quality;
  const browser = ['chrome', 'edge', 'firefox'].includes(settings.browser ?? '') ? settings.browser : defaults.browser;

  return {
    outputDir: settings.outputDir || defaults.outputDir,
    quality,
    playlist: Boolean(settings.playlist),
    subtitles: Boolean(settings.subtitles),
    useBrowserCookies: Boolean(settings.useBrowserCookies),
    browser
  };
}
