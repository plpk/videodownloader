import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, FolderOpen, RefreshCw, ShieldCheck } from 'lucide-react';
import type { AppSettings, DownloadEvent, ProbeResult, QueuedJob, ToolStatus } from '../../shared/types';
import { Header } from './components/Header';
import { QueueList } from './components/QueueList';
import { SettingsPanel } from './components/SettingsPanel';
import { StatusStrip } from './components/StatusStrip';
import { UrlPanel } from './components/UrlPanel';
import { createQueuedJobs } from './lib/queue';

const fallbackSettings: AppSettings = {
  outputDir: '',
  quality: 'best',
  playlist: false,
  subtitles: false,
  useBrowserCookies: false,
  browser: 'chrome'
};

export default function App(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>(fallbackSettings);
  const [toolStatus, setToolStatus] = useState<ToolStatus | null>(null);
  const [jobs, setJobs] = useState<QueuedJob[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [busyMessage, setBusyMessage] = useState<string | null>('Loading app settings...');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function boot(): Promise<void> {
      try {
        const [loadedSettings, loadedToolStatus] = await Promise.all([
          window.downloader.getSettings(),
          window.downloader.getToolStatus()
        ]);

        if (!mounted) {
          return;
        }

        setSettings(loadedSettings);
        setToolStatus(loadedToolStatus);
        setBusyMessage(null);
      } catch (error) {
        setBusyMessage(null);
        setNotice(error instanceof Error ? error.message : 'Could not initialize the app.');
      }
    }

    void boot();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return window.downloader.onDownloadEvent((event) => {
      setJobs((currentJobs) => currentJobs.map((job) => applyDownloadEvent(job, event)));
    });
  }, []);

  const selectedJob = useMemo(() => {
    return jobs.find((job) => job.id === selectedJobId) ?? jobs[0] ?? null;
  }, [jobs, selectedJobId]);

  const activeJobs = jobs.filter((job) => ['probing', 'downloading'].includes(job.status)).length;
  const completedJobs = jobs.filter((job) => job.status === 'completed').length;

  const persistSettings = useCallback(async (nextSettings: AppSettings) => {
    setSettings(nextSettings);
    try {
      await window.downloader.saveSettings(nextSettings);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Settings could not be saved.');
    }
  }, []);

  const chooseOutputDir = useCallback(async () => {
    const outputDir = await window.downloader.chooseOutputDir();
    if (outputDir) {
      await persistSettings({ ...settings, outputDir });
    }
  }, [persistSettings, settings]);

  const installTools = useCallback(async () => {
    setBusyMessage('Installing yt-dlp...');
    try {
      const nextStatus = await window.downloader.installTools();
      setToolStatus(nextStatus);
      setNotice('yt-dlp is installed and ready.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not install yt-dlp.');
    } finally {
      setBusyMessage(null);
    }
  }, []);

  const startDownloads = useCallback(async () => {
    const newJobs = createQueuedJobs(urlInput);
    if (newJobs.length === 0) {
      setNotice('Paste at least one video URL first.');
      return;
    }

    if (!settings.outputDir) {
      setNotice('Choose an output folder before downloading.');
      return;
    }

    setUrlInput('');
    setNotice(null);
    setJobs((currentJobs) => [...newJobs, ...currentJobs]);
    setSelectedJobId(newJobs[0].id);

    for (const job of newJobs) {
      await startSingleJob(job, settings);
    }
  }, [settings, urlInput]);

  const retryJob = useCallback(
    async (job: QueuedJob) => {
      setJobs((currentJobs) =>
        currentJobs.map((candidate) =>
          candidate.id === job.id
            ? { ...candidate, status: 'queued', progress: 0, error: undefined, speed: undefined, eta: undefined, log: [] }
            : candidate
        )
      );
      await startSingleJob(job, settings);
    },
    [settings]
  );

  const startSingleJob = useCallback(
    async (job: QueuedJob, jobSettings: AppSettings) => {
      setJobs((currentJobs) =>
        currentJobs.map((candidate) => (candidate.id === job.id ? { ...candidate, status: 'probing' } : candidate))
      );

      try {
        const request = { ...jobSettings, id: job.id, url: job.url };
        const metadata = await window.downloader.probe(request);
        setJobs((currentJobs) =>
          currentJobs.map((candidate) => mergeMetadata(candidate, job.id, metadata, 'ready'))
        );

        await window.downloader.startDownload(request);
      } catch (error) {
        setJobs((currentJobs) =>
          currentJobs.map((candidate) =>
            candidate.id === job.id
              ? {
                  ...candidate,
                  status: 'failed',
                  error: error instanceof Error ? error.message : 'Download failed.'
                }
              : candidate
          )
        );
      }
    },
    []
  );

  const cancelJob = useCallback(async (jobId: string) => {
    await window.downloader.cancelDownload(jobId);
    setJobs((currentJobs) =>
      currentJobs.map((job) => (job.id === jobId ? { ...job, status: 'cancelled' } : job))
    );
  }, []);

  const openJobFolder = useCallback(async (job: QueuedJob) => {
    if (job.outputPath) {
      await window.downloader.openFolder(job.outputPath);
    }
  }, []);

  return (
    <div className="app-shell">
      <Header toolStatus={toolStatus} activeJobs={activeJobs} />

      <main className="app-grid">
        <section className="workflow">
          <UrlPanel
            settings={settings}
            urlInput={urlInput}
            busy={Boolean(busyMessage)}
            onUrlInputChange={setUrlInput}
            onSettingsChange={persistSettings}
            onChooseOutputDir={chooseOutputDir}
            onStartDownloads={startDownloads}
          />

          {notice && (
            <div className="notice" role="status">
              <AlertCircle size={18} />
              <span>{notice}</span>
            </div>
          )}

          <QueueList
            jobs={jobs}
            selectedJobId={selectedJob?.id ?? null}
            onSelectJob={setSelectedJobId}
            onCancelJob={cancelJob}
            onRetryJob={retryJob}
            onOpenFolder={openJobFolder}
          />
        </section>

        <aside className="side-rail">
          <SettingsPanel
            settings={settings}
            toolStatus={toolStatus}
            busy={Boolean(busyMessage)}
            onSettingsChange={persistSettings}
            onInstallTools={installTools}
          />

          <section className="detail-panel">
            <div className="panel-title-row">
              <h2>Job Details</h2>
              {selectedJob?.status === 'completed' && <CheckCircle2 size={18} className="success-icon" />}
            </div>
            {selectedJob ? (
              <>
                <p className="detail-title">{selectedJob.title ?? selectedJob.url}</p>
                <div className="detail-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={!selectedJob.outputPath}
                    onClick={() => openJobFolder(selectedJob)}
                  >
                    <FolderOpen size={16} />
                    Open
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={!['failed', 'cancelled'].includes(selectedJob.status)}
                    onClick={() => retryJob(selectedJob)}
                  >
                    <RefreshCw size={16} />
                    Retry
                  </button>
                </div>
                <pre className="log-view">{selectedJob.log.slice(-10).join('\n') || 'No command output yet.'}</pre>
              </>
            ) : (
              <p className="muted">Add a URL to see extraction details and command output.</p>
            )}
          </section>

          <section className="rights-panel">
            <ShieldCheck size={20} />
            <p>
              Download content you own, have permission to save, or that a site allows. Browser login uses your
              existing access and does not bypass DRM or paywalls.
            </p>
          </section>
        </aside>
      </main>

      <StatusStrip
        busyMessage={busyMessage}
        totalJobs={jobs.length}
        activeJobs={activeJobs}
        completedJobs={completedJobs}
        toolStatus={toolStatus}
      />
    </div>
  );
}

function applyDownloadEvent(job: QueuedJob, event: DownloadEvent): QueuedJob {
  if (job.id !== event.jobId) {
    return job;
  }

  return {
    ...job,
    status: event.status ?? job.status,
    progress: event.progress ?? job.progress,
    speed: event.speed ?? job.speed,
    eta: event.eta ?? job.eta,
    outputPath: event.outputPath ?? job.outputPath,
    error: event.error ?? job.error,
    title: event.metadata?.title ?? job.title,
    thumbnail: event.metadata?.thumbnail ?? job.thumbnail,
    source: event.metadata?.source ?? job.source,
    duration: event.metadata?.duration ?? job.duration,
    log: event.logLine ? [...job.log, event.logLine].slice(-80) : job.log
  };
}

function mergeMetadata(job: QueuedJob, jobId: string, metadata: ProbeResult, status: QueuedJob['status']): QueuedJob {
  if (job.id !== jobId) {
    return job;
  }

  return {
    ...job,
    status,
    title: metadata.title ?? job.title,
    thumbnail: metadata.thumbnail ?? job.thumbnail,
    source: metadata.source ?? job.source,
    duration: metadata.duration ?? job.duration
  };
}
