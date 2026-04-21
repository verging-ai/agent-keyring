import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
import { providerAccounts } from "../data/mock";

export function ProvidersPage() {
  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <div className="eyebrow">Providers</div>
          <h1>Manage provider credentials with validation built in.</h1>
          <p>
            The MVP page should handle add, edit, validate, and model refresh
            flows without exposing raw config complexity.
          </p>
        </div>
      </header>

      <SectionCard
        title="Provider accounts"
        description="Each card becomes the entry point for key storage, validation, and model capability fetch."
      >
        <div className="tile-grid">
          {providerAccounts.map((provider) => (
            <article key={provider.name} className="info-tile">
              <div className="tile-topline">
                <strong>{provider.name}</strong>
                <StatusPill label={provider.status} tone={provider.tone} />
              </div>
              <p>{provider.note}</p>
              <div className="tag-row">
                {provider.models.map((model) => (
                  <span key={model} className="soft-tag">
                    {model}
                  </span>
                ))}
              </div>
              <div className="button-row">
                <button type="button">Edit key</button>
                <button type="button" className="button-secondary">
                  Validate
                </button>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Next implementation slices"
        description="These skeleton areas map directly to MVP behavior."
      >
        <div className="check-grid">
          <div className="check-item">Encrypted local key storage adapter</div>
          <div className="check-item">Provider-specific validation runner</div>
          <div className="check-item">Model list and capability cache</div>
          <div className="check-item">Error handling for revoked or expired keys</div>
        </div>
      </SectionCard>
    </div>
  );
}

