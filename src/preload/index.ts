import { contextBridge, ipcRenderer } from 'electron';
import type { AppSettings, DownloadEvent, DownloadRequest, ProbeResult, ToolStatus } from '../shared/types';

const api = {
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: AppSettings): Promise<AppSettings> => ipcRenderer.invoke('settings:save', settings),
  chooseOutputDir: (): Promise<string | null> => ipcRenderer.invoke('dialog:choose-output-dir'),
  getToolStatus: (): Promise<ToolStatus> => ipcRenderer.invoke('tools:status'),
  installTools: (): Promise<ToolStatus> => ipcRenderer.invoke('tools:install'),
  probe: (request: Omit<DownloadRequest, 'ffmpegPath'>): Promise<ProbeResult> => ipcRenderer.invoke('probe:start', request),
  startDownload: (request: Omit<DownloadRequest, 'ffmpegPath'>): Promise<void> => ipcRenderer.invoke('download:start', request),
  cancelDownload: (jobId: string): Promise<boolean> => ipcRenderer.invoke('download:cancel', jobId),
  openFolder: (path: string): Promise<void> => ipcRenderer.invoke('folder:open', path),
  onDownloadEvent: (callback: (event: DownloadEvent) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, downloadEvent: DownloadEvent): void => {
      callback(downloadEvent);
    };

    ipcRenderer.on('download:event', listener);
    return () => ipcRenderer.removeListener('download:event', listener);
  }
};

contextBridge.exposeInMainWorld('downloader', api);

export type DownloaderApi = typeof api;
