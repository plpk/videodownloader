import { EventEmitter } from 'node:events';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DownloadEvent, DownloadRequest } from '../../shared/types';

const childProcessMock = vi.hoisted(() => {
  return {
    child: null as FakeChild | null,
    spawn: vi.fn()
  };
});

vi.mock('node:child_process', () => ({
  spawn: childProcessMock.spawn
}));

vi.mock('./tools', () => ({
  ensureYtDlp: vi.fn(async () => '/opt/tools/download-tool'),
  getFfmpegPath: vi.fn(() => '/opt/tools/media-tool'),
  ensureJsRuntimeShim: vi.fn(async () => '/opt/tools/node-shim')
}));

import { DownloaderManager } from './manager';

interface FakeChild extends EventEmitter {
  stdout: EventEmitter;
  stderr: EventEmitter;
  kill: ReturnType<typeof vi.fn>;
}

function createFakeChild(): FakeChild {
  const child = new EventEmitter() as FakeChild;
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.kill = vi.fn(() => true);
  return child;
}

function createRequest(): Omit<DownloadRequest, 'ffmpegPath'> {
  return {
    id: 'job-1',
    url: 'https://example.com/video',
    outputDir: '/Users/example/Downloads',
    quality: 'best',
    playlist: false,
    subtitles: false,
    useBrowserCookies: false,
    browser: 'chrome'
  };
}

describe('DownloaderManager cancellation', () => {
  beforeEach(() => {
    childProcessMock.child = createFakeChild();
    childProcessMock.spawn.mockReset();
    childProcessMock.spawn.mockReturnValue(childProcessMock.child);
  });

  it('emits cancelled instead of failed when a killed process closes with a non-zero code', async () => {
    const manager = new DownloaderManager('/Users/example/Library/Application Support/vd');
    const events: DownloadEvent[] = [];

    await manager.startDownload(createRequest(), (event) => events.push(event));
    expect(manager.cancel('job-1')).toBe(true);

    childProcessMock.child?.emit('close', 1);

    expect(events.at(-1)).toEqual({ jobId: 'job-1', status: 'cancelled' });
    expect(events).not.toEqual(expect.arrayContaining([expect.objectContaining({ status: 'failed' })]));
  });
});
