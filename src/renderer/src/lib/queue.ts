import type { QueuedJob } from '../../../shared/types';

export function createQueuedJobs(input: string): QueuedJob[] {
  return input
    .split(/\s+/)
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => ({
      id: crypto.randomUUID(),
      url,
      status: 'queued',
      progress: 0,
      log: []
    }));
}
