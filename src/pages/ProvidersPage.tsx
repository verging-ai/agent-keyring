import { useEffect } from "react";
import { SectionCard } from "../shared/ui/SectionCard";
import { StatusPill } from "../shared/ui/StatusPill";
import { useProviders } from "../features/providers";

function validationTone(status?: string): "good" | "warn" | "neutral" {
  if (status === "valid") return "good";
  if (status === "invalid" || status === "expired" || status === "rate_limited") return "warn";
  return "neutral";
}

export function ProvidersPage() {
  const { providers, loading, error, fetchProviders, validateKey, listModels } =
    useProviders();

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <div className="eyebrow">Providers</div>
          <h1>Manage provider credentials with validation built in.</h1>
          <p>
            Add, edit, validate, and refresh model lists for your LLM providers.
          </p>
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert">{error}</div>
      )}

      <SectionCard
        title="Provider accounts"
        description="Each card is the entry point for key storage, validation, and model capability fetch."
      >
        {loading ? (
          <p>Loading providers…</p>
        ) : providers.length === 0 ? (
          <p>No providers configured yet. Add one to get started.</p>
        ) : (
          <div className="tile-grid">
            {providers.map((provider) => (
              <article key={provider.providerId} className="info-tile">
                <div className="tile-topline">
                  <strong>{provider.providerId}</strong>
                  <StatusPill
                    label={provider.apiKey ? "Configured" : "No key"}
                    tone={provider.apiKey ? "good" : "neutral"}
                  />
                </div>
                {provider.baseUrl && <p>Base URL: {provider.baseUrl}</p>}
                <div className="tag-row">
                  {provider.selectedModels.map((model) => (
                    <span key={model} className="soft-tag">
                      {model}
                    </span>
                  ))}
                </div>
                <div className="button-row">
                  <button type="button">Edit key</button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() =>
                      validateKey(provider.providerId, provider.apiKey)
                    }
                  >
                    Validate
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
