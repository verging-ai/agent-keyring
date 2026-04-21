import { SectionCard } from "../components/ui/SectionCard";

export function SettingsPage() {
  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <div className="eyebrow">Settings</div>
          <h1>Reserve settings for trust, storage, and app-level behavior.</h1>
          <p>
            Keep this page narrow in the MVP: backup location, telemetry policy,
            log verbosity, and key storage preferences.
          </p>
        </div>
      </header>

      <SectionCard
        title="MVP settings groups"
        description="These groups are enough to support a safe local-first beta without overbuilding."
      >
        <div className="check-grid">
          <div className="check-item">Backup directory and retention policy</div>
          <div className="check-item">Local secret storage strategy</div>
          <div className="check-item">Optional diagnostics and error export</div>
          <div className="check-item">Connector lab / experimental targets</div>
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

