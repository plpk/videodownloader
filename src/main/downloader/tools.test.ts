import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ensureYtDlp, getYtDlpPath } from './tools';

describe('ensureYtDlp', () => {
  it('redownloads the tool when force is requested', async () => {
    const userDataDir = await makeTempDir();
    const toolPath = getYtDlpPath(userDataDir);
    await mkdir(dirname(toolPath), { recursive: true });
    await writeFile(toolPath, 'old', 'utf8');
    const downloads: string[] = [];

    await ensureYtDlp(userDataDir, {
      force: true,
      downloadFile: async (_url, destination) => {
        downloads.push(destination);
        await writeFile(destination, 'new', 'utf8');
      }
    });

    expect(downloads).toHaveLength(1);
    expect(await readFile(toolPath, 'utf8')).toBe('new');
  });
});

async function makeTempDir(): Promise<string> {
  const { mkdtemp } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const { tmpdir } = await import('node:os');
  return await mkdtemp(join(tmpdir(), 'vd-tools-test-'));
}
