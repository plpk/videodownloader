import type {
  AppSettings,
  DownloadEvent,
  DownloadRequest,
  ProbeResult,
  ToolStatus
} from '../../shared/types';

interface DownloaderApi {
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: AppSettings) => Promise<AppSettings>;
  chooseOutputDir: () => Promise<string | null>;
  getToolStatus: () => Promise<ToolStatus>;
  installTools: () => Promise<ToolStatus>;
  probe: (request: Omit<DownloadRequest, 'ffmpegPath'>) => Promise<ProbeResult>;
  startDownload: (request: Omit<DownloadRequest, 'ffmpegPath'>) => Promise<void>;
  cancelDownload: (jobId: string) => Promise<boolean>;
  openFolder: (path: string) => Promise<void>;
  onDownloadEvent: (callback: (event: DownloadEvent) => void) => () => void;
}

declare global {
  interface Window {
    downloader: DownloaderApi;
  }
}

export {};
