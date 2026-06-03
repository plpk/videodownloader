import { app, BrowserWindow } from 'electron';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DownloaderManager } from './downloader/manager';
import { registerIpc } from './ipc';

let mainWindow: BrowserWindow | null = null;

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 960,
    minHeight: 620,
    title: 'Video Downloader',
    backgroundColor: '#f6f7f9',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  const manager = new DownloaderManager(app.getPath('userData'));
  registerIpc(mainWindow, manager, app.getPath('userData'));

  if (process.env.ELECTRON_RENDERER_URL) {
    await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    await mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  await maybeCaptureSmokeScreenshot(mainWindow);
}

async function maybeCaptureSmokeScreenshot(window: BrowserWindow): Promise<void> {
  const screenshotPath = process.env.VD_SMOKE_SCREENSHOT;
  if (!screenshotPath) {
    return;
  }

  window.show();
  const mounted = await window.webContents.executeJavaScript(
    `new Promise((resolve) => {
      const started = Date.now();
      const check = () => {
        const root = document.getElementById('root');
        if (document.readyState === 'complete' && root && root.children.length > 0) {
          resolve(true);
          return;
        }
        if (Date.now() - started > 5000) {
          resolve(false);
          return;
        }
        setTimeout(check, 100);
      };
      check();
    })`
  );
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const image = await window.webContents.capturePage();
  if (image.isEmpty()) {
    throw new Error('Smoke screenshot capture returned an empty image.');
  }
  await writeFile(screenshotPath, image.toPNG());
  if (!mounted) {
    await writeFile(
      `${screenshotPath}.txt`,
      await window.webContents.executeJavaScript(
        `JSON.stringify({
          readyState: document.readyState,
          bodyText: document.body?.innerText ?? '',
          rootChildren: document.getElementById('root')?.children.length ?? null,
          title: document.title
        }, null, 2)`
      ),
      'utf8'
    );
  }
  app.quit();
}

app.whenReady().then(async () => {
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
