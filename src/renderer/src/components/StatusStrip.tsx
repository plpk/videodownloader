import { Circle, Loader2 } from 'lucide-react';
import type { ToolStatus } from '../../../shared/types';

interface StatusStripProps {
  busyMessage: string | null;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  toolStatus: ToolStatus | null;
}

export function StatusStrip({
  busyMessage,
  totalJobs,
  activeJobs,
  completedJobs,
  toolStatus
}: StatusStripProps): JSX.Element {
  return (
    <footer className="status-strip">
      <span className="strip-item">
        {busyMessage ? <Loader2 size={15} className="spin" /> : <Circle size={10} className="dot" />}
        {busyMessage ?? 'Ready'}
      </span>
      <span>{totalJobs} total</span>
      <span>{activeJobs} active</span>
      <span>{completedJobs} completed</span>
      <span>{toolStatus?.ffmpegPath ? 'Media tool available' : 'Media tool missing'}</span>
    </footer>
  );
}
