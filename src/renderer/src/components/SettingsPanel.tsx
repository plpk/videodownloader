import { Chrome, DownloadCloud, KeyRound, Wrench } from 'lucide-react';
import type { AppSettings, BrowserChoice, ToolStatus } from '../../../shared/types';

const browserOptions: Array<{ value: BrowserChoice; label: string }> = [
  { value: 'chrome', label: 'Chrome' },
  { value: 'edge', label: 'Edge' },
  { value: 'firefox', label: 'Firefox' }
];

interface SettingsPanelProps {
  settings: AppSettings;
  toolStatus: ToolStatus | null;
  busy: boolean;
  onSettingsChange: (settings: AppSettings) => Promise<void>;
  onInstallTools: () => Promise<void>;
}

export function SettingsPanel({
  settings,
  toolStatus,
  busy,
  onSettingsChange,
  onInstallTools
}: SettingsPanelProps): JSX.Element {
  return (
    <section className="panel settings-panel">
      <div className="panel-title-row">
        <div>
          <h2>Advanced</h2>
          <p>Use your existing browser access when a site requires login.</p>
        </div>
        <KeyRound size={19} />
      </div>

      <label className="switch-row">
        <span>
          <strong>Use browser login</strong>
          <small>Reads cookies only when a download starts.</small>
        </span>
        <input
          type="checkbox"
          checked={settings.useBrowserCookies}
          onChange={(event) => onSettingsChange({ ...settings, useBrowserCookies: event.target.checked })}
        />
      </label>

      <label className="select-field full">
        <span>Browser</span>
        <select
          value={settings.browser}
          disabled={!settings.useBrowserCookies}
          onChange={(event) => onSettingsChange({ ...settings, browser: event.target.value as BrowserChoice })}
        >
          {browserOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="tool-card">
        <div>
          <Wrench size={18} />
          <span>{toolStatus?.ytDlpInstalled ? 'Downloader engine ready' : 'Downloader engine missing'}</span>
        </div>
        <button className="secondary-button" type="button" disabled={busy} onClick={onInstallTools}>
          <DownloadCloud size={16} />
          {toolStatus?.ytDlpInstalled ? 'Update' : 'Install'}
        </button>
      </div>

      <div className="browser-note">
        <Chrome size={17} />
        <p>Close the selected browser if cookie extraction fails; some profiles lock cookie databases while open.</p>
      </div>
    </section>
  );
}
