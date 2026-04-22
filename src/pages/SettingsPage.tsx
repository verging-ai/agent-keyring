import { SectionCard } from "../shared/ui/SectionCard";
import { useSettings } from "../features/settings";

export function SettingsPage() {
  const { settings, updateBackupDirectory } = useSettings();

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <div className="eyebrow">Settings</div>
          <h1>Trust, storage, and app-level behavior.</h1>
          <p>
            Configure backup location, storage preferences, and other
            application settings.
          </p>
        </div>
      </header>

      <SectionCard
        title="Backup configuration"
        description="Control where configuration backups are stored before each sync."
      >
        <div className="form-group">
          <label htmlFor="backup-dir">Backup directory</label>
          <input
            id="backup-dir"
            type="text"
            value={settings.backupDirectory}
            onChange={(e) => updateBackupDirectory(e.target.value)}
            placeholder="Default: app data directory / backups"
          />
          <p className="form-hint">
            Leave empty to use the default backup location.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        title="Out of scope for now"
        description="Keeping this list visible helps protect the MVP."
      >
        <div className="check-grid">
          <div className="check-item">Hosted team accounts</div>
          <div className="check-item">Cloud sync and remote vaults</div>
          <div className="check-item">Shared gateway traffic routing</div>
          <div className="check-item">Conversation UI and prompt tooling</div>
        </div>
      </SectionCard>
    </div>
  );
}
