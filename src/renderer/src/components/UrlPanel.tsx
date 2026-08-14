import { Download, FolderOpen, ListVideo } from 'lucide-react';
import type { AppSettings, QualityPreset } from '../../../shared/types';

const qualityOptions: Array<{ value: QualityPreset; label: string }> = [
  { value: 'best', label: 'Best (edit-friendly)' },
  { value: '2160', label: '4K (max resolution)' },
  { value: '1440', label: '1440p' },
  { value: '1080', label: '1080p' },
  { value: '720', label: '720p' },
  { value: '480', label: '480p' },
  { value: 'audio', label: 'Audio — MP3' },
  { value: 'audio-best', label: 'Audio — original quality' }
];

interface UrlPanelProps {
  settings: AppSettings;
  urlInput: string;
  busy: boolean;
  onUrlInputChange: (value: string) => void;
  onSettingsChange: (settings: AppSettings) => Promise<void>;
  onChooseOutputDir: () => Promise<void>;
  onStartDownloads: () => Promise<void>;
}

export function UrlPanel({
  settings,
  urlInput,
  busy,
  onUrlInputChange,
  onSettingsChange,
  onChooseOutputDir,
  onStartDownloads
}: UrlPanelProps): JSX.Element {
  return (
    <section className="panel url-panel">
      <div className="panel-title-row">
        <div>
          <h2>Add Videos</h2>
          <p>Paste one URL per line or paste a batch separated by spaces.</p>
        </div>
        <ListVideo size={20} />
      </div>

      <textarea
        className="url-input"
        value={urlInput}
        spellCheck={false}
        placeholder="https://example.com/video/123&#10;https://media.example.org/watch/abc"
        onChange={(event) => onUrlInputChange(event.target.value)}
      />

      <div className="control-row">
        <label className="folder-field">
          <span>Output Folder</span>
          <input value={settings.outputDir} readOnly />
        </label>
        <button className="icon-button text-button" type="button" onClick={onChooseOutputDir}>
          <FolderOpen size={17} />
          Browse
        </button>
      </div>

      <div className="options-row">
        <label className="select-field">
          <span>Quality</span>
          <select
            value={settings.quality}
            onChange={(event) => onSettingsChange({ ...settings, quality: event.target.value as QualityPreset })}
          >
            {qualityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="check-control">
          <input
            type="checkbox"
            checked={settings.playlist}
            onChange={(event) => onSettingsChange({ ...settings, playlist: event.target.checked })}
          />
          Playlists
        </label>

        <label className="check-control">
          <input
            type="checkbox"
            checked={settings.subtitles}
            onChange={(event) => onSettingsChange({ ...settings, subtitles: event.target.checked })}
          />
          Subtitles
        </label>

        <button className="primary-button" type="button" disabled={busy} onClick={onStartDownloads}>
          <Download size={18} />
          Download
        </button>
      </div>
    </section>
  );
}
