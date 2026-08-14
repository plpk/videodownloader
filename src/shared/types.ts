export type QualityPreset = 'best' | '2160' | '1440' | '1080' | '720' | '480' | 'audio' | 'audio-best';

export type BrowserChoice = 'chrome' | 'edge' | 'firefox' | 'safari' | 'brave';

export type JobStatus =
  | 'queued'
  | 'probing'
  | 'ready'
  | 'downloading'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface AppSettings {
  outputDir: string;
  quality: QualityPreset;
  playlist: boolean;
  subtitles: boolean;
  useBrowserCookies: boolean;
  browser: BrowserChoice;
}

export interface DownloadRequest extends AppSettings {
  id?: string;
  url: string;
  ffmpegPath: string;
  /** Path to a Node-compatible runtime yt-dlp can use for YouTube JS challenges. */
  jsRuntimePath?: string | null;
}

export interface QueuedJob {
  id: string;
  url: string;
  title?: string;
  thumbnail?: string;
  source?: string;
  duration?: number;
  status: JobStatus;
  progress: number;
  speed?: string;
  eta?: string;
  outputPath?: string;
  error?: string;
  log: string[];
}

export interface ProbeResult {
  title?: string;
  thumbnail?: string;
  source?: string;
  duration?: number;
  webpageUrl?: string;
}

export interface ToolStatus {
  ytDlpInstalled: boolean;
  ytDlpPath: string;
  ffmpegPath: string | null;
  jsRuntimePath: string | null;
}

export type ProgressEvent =
  | {
      kind: 'progress';
      percent: number;
      size?: string;
      speed?: string;
      eta?: string;
    }
  | {
      kind: 'destination';
      path: string;
    }
  | {
      kind: 'completed';
      percent: 100;
    };

export interface DownloadEvent {
  jobId: string;
  status?: JobStatus;
  progress?: number;
  speed?: string;
  eta?: string;
  outputPath?: string;
  error?: string;
  logLine?: string;
  metadata?: ProbeResult;
}
