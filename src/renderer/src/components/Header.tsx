import { Activity, DownloadCloud, Wrench } from 'lucide-react';
import type { ToolStatus } from '../../../shared/types';

interface HeaderProps {
  toolStatus: ToolStatus | null;
  activeJobs: number;
}

export function Header({ toolStatus, activeJobs }: HeaderProps): JSX.Element {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-mark">
          <DownloadCloud size={22} />
        </div>
        <div>
          <h1>Video Downloader</h1>
          <p>Supported public and user-accessible web videos</p>
        </div>
      </div>

      <div className="header-status">
        <span className="status-pill">
          <Activity size={15} />
          {activeJobs} active
        </span>
        <span className={toolStatus?.ytDlpInstalled ? 'status-pill ready' : 'status-pill warning'}>
          <Wrench size={15} />
          {toolStatus?.ytDlpInstalled ? 'Tool ready' : 'Tool needed'}
        </span>
      </div>
    </header>
  );
}
