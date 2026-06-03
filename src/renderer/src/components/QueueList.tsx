import { Ban, FolderOpen, RefreshCw, RotateCcw, Video } from 'lucide-react';
import type { QueuedJob } from '../../../shared/types';

interface QueueListProps {
  jobs: QueuedJob[];
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => Promise<void>;
  onRetryJob: (job: QueuedJob) => Promise<void>;
  onOpenFolder: (job: QueuedJob) => Promise<void>;
}

export function QueueList({
  jobs,
  selectedJobId,
  onSelectJob,
  onCancelJob,
  onRetryJob,
  onOpenFolder
}: QueueListProps): JSX.Element {
  return (
    <section className="panel queue-panel">
      <div className="panel-title-row">
        <div>
          <h2>Queue</h2>
          <p>{jobs.length === 0 ? 'No downloads yet.' : `${jobs.length} item${jobs.length === 1 ? '' : 's'} in this session.`}</p>
        </div>
      </div>

      <div className={jobs.length === 0 ? 'queue-list empty' : 'queue-list'} aria-label="Download queue">
        {jobs.length === 0 ? (
          <div className="empty-state">
            <Video size={28} />
            <p>Paste a URL above to start a download.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <article
              key={job.id}
              className={job.id === selectedJobId ? 'queue-row selected' : 'queue-row'}
              onClick={() => onSelectJob(job.id)}
            >
              <div className="thumb">
                {job.thumbnail ? <img src={job.thumbnail} alt="" /> : <Video size={22} />}
              </div>

              <div className="queue-main">
                <div className="queue-title-line">
                  <strong>{job.title ?? job.url}</strong>
                  <span className={`status-label ${job.status}`}>{statusLabel(job.status)}</span>
                </div>
                <p>{job.source ? `${job.source} · ${job.url}` : job.url}</p>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.min(job.progress, 100)}%` }} />
                </div>
              </div>

              <div className="queue-meta">
                <span>{job.speed ?? 'Idle'}</span>
                <span>{job.eta ? `ETA ${job.eta}` : `${Math.round(job.progress)}%`}</span>
              </div>

              <div className="row-actions">
                {['downloading', 'probing'].includes(job.status) ? (
                  <button className="icon-button" type="button" title="Cancel" onClick={(event) => stop(event, () => onCancelJob(job.id))}>
                    <Ban size={16} />
                  </button>
                ) : (
                  <button
                    className="icon-button"
                    type="button"
                    title="Retry"
                    disabled={!['failed', 'cancelled'].includes(job.status)}
                    onClick={(event) => stop(event, () => onRetryJob(job))}
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
                <button
                  className="icon-button"
                  type="button"
                  title="Open folder"
                  disabled={!job.outputPath}
                  onClick={(event) => stop(event, () => onOpenFolder(job))}
                >
                  <FolderOpen size={16} />
                </button>
                <RefreshCw className={['probing', 'downloading'].includes(job.status) ? 'spin subtle-icon' : 'subtle-icon'} size={15} />
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function statusLabel(status: QueuedJob['status']): string {
  const labels: Record<QueuedJob['status'], string> = {
    queued: 'Queued',
    probing: 'Reading',
    ready: 'Ready',
    downloading: 'Downloading',
    completed: 'Done',
    failed: 'Failed',
    cancelled: 'Cancelled'
  };

  return labels[status];
}

function stop(event: React.MouseEvent, action: () => void): void {
  event.stopPropagation();
  action();
}
