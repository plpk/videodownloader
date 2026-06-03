import { describe, expect, it } from 'vitest';
import type { QueuedJob } from '../../shared/types';
import { mergeMetadata } from './App';

function createJob(status: QueuedJob['status']): QueuedJob {
  return {
    id: 'job-1',
    url: 'https://example.com/video',
    status,
    progress: 0,
    log: []
  };
}

describe('mergeMetadata', () => {
  it('does not revive a cancelled job when probe metadata resolves late', () => {
    const job = createJob('cancelled');

    const result = mergeMetadata(job, 'job-1', { title: 'Late metadata' }, 'ready');

    expect(result).toEqual(job);
  });
});
