import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { dirname } from 'node:path';
import type { DownloadEvent, DownloadRequest, ProbeResult } from '../../shared/types';
import { buildDownloadArgs, buildProbeArgs } from './args';
import { parseProgressLine } from './progress';
import { ensureJsRuntimeShim, ensureYtDlp, getFfmpegPath } from './tools';

type EventSink = (event: DownloadEvent) => void;

export class DownloaderManager {
  private readonly activeProcesses = new Map<string, ChildProcessWithoutNullStreams>();
  private readonly cancelledProcesses = new WeakSet<ChildProcessWithoutNullStreams>();

  constructor(private readonly userDataDir: string) {}

  async probe(request: Omit<DownloadRequest, 'ffmpegPath'>): Promise<ProbeResult> {
    const ytDlpPath = await ensureYtDlp(this.userDataDir);
    const jsRuntimePath = await ensureJsRuntimeShim(this.userDataDir);
    const args = buildProbeArgs({ ...request, jsRuntimePath });
    const { stdout, stderr, code } = await runProcess(ytDlpPath, args);

    if (code !== 0) {
      throw new Error(cleanError(stderr) || 'Could not read video information from this URL.');
    }

    const metadata = parseProbeJson(stdout);
    if (!metadata) {
      throw new Error('The download tool did not return readable video metadata for this URL.');
    }

    return metadata;
  }

  async startDownload(request: Omit<DownloadRequest, 'ffmpegPath'>, onEvent: EventSink): Promise<void> {
    const ffmpegPath = getFfmpegPath();
    if (!ffmpegPath) {
      throw new Error('The media tool could not be located. Reinstall the app or check bundled dependencies.');
    }

    const ytDlpPath = await ensureYtDlp(this.userDataDir);
    const jsRuntimePath = await ensureJsRuntimeShim(this.userDataDir);
    const jobId = request.id ?? crypto.randomUUID();
    const args = buildDownloadArgs({ ...request, ffmpegPath, jsRuntimePath });
    const child = spawn(ytDlpPath, args, {
      cwd: dirname(ytDlpPath),
      windowsHide: true
    });

    this.activeProcesses.set(jobId, child);
    onEvent({ jobId, status: 'downloading', progress: 0 });

    let stderr = '';
    let stdoutRemainder = '';
    let stderrRemainder = '';

    child.stdout.on('data', (chunk: Buffer) => {
      stdoutRemainder = consumeLines(stdoutRemainder + chunk.toString('utf8'), (line) => {
        handleOutputLine(jobId, line, onEvent);
      });
    });

    child.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf8');
      stderr += text;
      stderrRemainder = consumeLines(stderrRemainder + text, (line) => {
        handleOutputLine(jobId, line, onEvent);
      });
    });

    child.on('error', (error) => {
      this.activeProcesses.delete(jobId);
      onEvent({ jobId, status: 'failed', error: error.message });
    });

    child.on('close', (code) => {
      const isCurrentProcess = this.activeProcesses.get(jobId) === child;
      if (isCurrentProcess) {
        this.activeProcesses.delete(jobId);
      }

      if (this.cancelledProcesses.has(child)) {
        this.cancelledProcesses.delete(child);
        if (!this.activeProcesses.has(jobId)) {
          onEvent({ jobId, status: 'cancelled' });
        }
        return;
      }

      if (code === 0) {
        onEvent({ jobId, status: 'completed', progress: 100 });
        return;
      }

      if (code === null) {
        onEvent({ jobId, status: 'cancelled' });
        return;
      }

      onEvent({
        jobId,
        status: 'failed',
        error: cleanError(stderr) || `The download tool exited with code ${code}.`
      });
    });
  }

  cancel(jobId: string): boolean {
    const child = this.activeProcesses.get(jobId);
    if (!child) {
      return false;
    }

    this.cancelledProcesses.add(child);
    child.kill();
    this.activeProcesses.delete(jobId);
    return true;
  }
}

function handleOutputLine(jobId: string, line: string, onEvent: EventSink): void {
  if (!line.trim()) {
    return;
  }

  onEvent({ jobId, logLine: line });

  const progress = parseProgressLine(line);
  if (!progress) {
    return;
  }

  if (progress.kind === 'progress') {
    onEvent({
      jobId,
      progress: progress.percent,
      speed: progress.speed,
      eta: progress.eta
    });
  }

  if (progress.kind === 'destination') {
    onEvent({ jobId, outputPath: progress.path });
  }

  if (progress.kind === 'completed') {
    onEvent({ jobId, progress: 100 });
  }
}

function consumeLines(buffer: string, onLine: (line: string) => void): string {
  const lines = buffer.split(/\r?\n/);
  const remainder = lines.pop() ?? '';
  lines.forEach(onLine);
  return remainder;
}

async function runProcess(command: string, args: string[]): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
    });

    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });

    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ stdout, stderr, code });
    });
  });
}

function parseProbeJson(stdout: string): ProbeResult | null {
  const line = stdout
    .split(/\r?\n/)
    .map((candidate) => candidate.trim())
    .find((candidate) => candidate.startsWith('{') && candidate.endsWith('}'));

  if (!line) {
    return null;
  }

  const data = JSON.parse(line) as Record<string, unknown>;

  return {
    title: stringValue(data.title),
    thumbnail: stringValue(data.thumbnail),
    source: stringValue(data.extractor_key) ?? stringValue(data.extractor),
    duration: numberValue(data.duration),
    webpageUrl: stringValue(data.webpage_url)
  };
}

function cleanError(stderr: string): string {
  const lines = stderr
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const errorLine = [...lines].reverse().find((line) => /error:/i.test(line));
  return (errorLine ?? lines.at(-1) ?? '').replace(/^ERROR:\s*/i, '');
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}
