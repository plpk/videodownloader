import type { ProgressEvent } from '../../shared/types';

const progressPattern =
  /^\[download]\s+(?<percent>\d+(?:\.\d+)?)%\s+of\s+(?<size>\S+)(?:\s+at\s+(?<speed>\S+))?(?:\s+ETA\s+(?<eta>\S+))?/i;

export function parseProgressLine(line: string): ProgressEvent | null {
  const destinationMatch = line.match(/^\[download]\s+Destination:\s+(?<path>.+)$/i);
  if (destinationMatch?.groups?.path) {
    return {
      kind: 'destination',
      path: destinationMatch.groups.path.trim()
    };
  }

  if (/^\[download]\s+100%/i.test(line)) {
    return {
      kind: 'completed',
      percent: 100
    };
  }

  const progressMatch = line.match(progressPattern);
  if (!progressMatch?.groups?.percent) {
    return null;
  }

  return {
    kind: 'progress',
    percent: Number.parseFloat(progressMatch.groups.percent),
    size: progressMatch.groups.size,
    speed: progressMatch.groups.speed,
    eta: progressMatch.groups.eta
  };
}
