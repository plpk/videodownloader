import { describe, expect, it } from 'vitest';
import { parseProgressLine } from './progress';

describe('parseProgressLine', () => {
  it('parses active download progress lines', () => {
    const progress = parseProgressLine('[download]  42.8% of   78.54MiB at    3.21MiB/s ETA 00:14');

    expect(progress).toEqual({
      kind: 'progress',
      percent: 42.8,
      size: '78.54MiB',
      speed: '3.21MiB/s',
      eta: '00:14'
    });
  });

  it('parses completed destination lines', () => {
    const progress = parseProgressLine('[download] Destination: C:\\Videos\\Demo [abc123].mp4');

    expect(progress).toEqual({
      kind: 'destination',
      path: 'C:\\Videos\\Demo [abc123].mp4'
    });
  });

  it('returns null for unrelated output', () => {
    expect(parseProgressLine('[extractor] Extracting URL: https://example.com/watch/abc123')).toBeNull();
  });
});
