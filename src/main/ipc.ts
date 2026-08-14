import { dialog, ipcMain, shell, type BrowserWindow } from 'electron';
import type { AppSettings, DownloadRequest } from '../shared/types';
import { DownloaderManager } from './downloader/manager';
import { ensureJsRuntimeShim, ensureYtDlp, getToolStatus } from './downloader/tools';
import { loadSettings, saveSettings } from './settings';

export function registerIpc(window: BrowserWindow, manager: DownloaderManager, userDataDir: string): void {
  ipcMain.handle('settings:get', async () => {
    return await loadSettings(userDataDir);
  });

  ipcMain.handle('settings:save', async (_event, settings: AppSettings) => {
    return await saveSettings(userDataDir, settings);
  });

  ipcMain.handle('dialog:choose-output-dir', async () => {
    const result = await dialog.showOpenDialog(window, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'Choose download folder'
    });

    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle('tools:status', async () => {
    return await getToolStatus(userDataDir);
  });

  ipcMain.handle('tools:install', async () => {
    await ensureYtDlp(userDataDir, { force: true });
    await ensureJsRuntimeShim(userDataDir);
    return await getToolStatus(userDataDir);
  });

  ipcMain.handle('probe:start', async (_event, request: Omit<DownloadRequest, 'ffmpegPath'>) => {
    return await manager.probe(request);
  });

  ipcMain.handle('download:start', async (_event, request: Omit<DownloadRequest, 'ffmpegPath'>) => {
    await manager.startDownload(request, (downloadEvent) => {
      window.webContents.send('download:event', downloadEvent);
    });
  });

  ipcMain.handle('download:cancel', (_event, jobId: string) => {
    return manager.cancel(jobId);
  });

  ipcMain.handle('folder:open', async (_event, path: string) => {
    if (!path) {
      return;
    }

    shell.showItemInFolder(path);
  });
}
