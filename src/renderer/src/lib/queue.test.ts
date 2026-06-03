import { describe, expect, it } from 'vitest';
import { createQueuedJobs } from './queue';

describe('createQueuedJobs', () => {
  it('splits pasted URLs into stable queued jobs', () => {
    const jobs = createQueuedJobs('https://youtu.be/a\n\n https://example.com/video  ');

    expect(jobs).toHaveLength(2);
    expect(jobs[0]).toMatchObject({
      url: 'https://youtu.be/a',
      status: 'queued',
      progress: 0
    });
    expect(jobs[1]).toMatchObject({
      url: 'https://example.com/video',
      status: 'queued',
      progress: 0
    });
    expect(jobs[0].id).not.toEqual(jobs[1].id);
  });
});
