import { useEffect } from "react";
import { SectionCard } from "../shared/ui/SectionCard";
import { StatusPill } from "../shared/ui/StatusPill";
import { useProviders } from "../features/providers";
import { useDiscovery } from "../features/discovery";
import { useSync } from "../features/sync";
import type { DiscoveryStatus, SyncOutcome } from "../shared/types";

function discoveryTone(status: DiscoveryStatus): "good" | "warn" | "neutral" {
  if (status === "Installed") return "good";
  if (status === "DetectFailed" || status === "DetectTimeout") return "warn";
  return "neutral";
}

function outcomeTone(outcome: SyncOutcome): "good" | "warn" | "neutral" {
  if (outcome === "Success") return "good";
  if (outcome === "Failed" || outcome === "RolledBack") return "warn";
  return "neutral";
}

export function DashboardPage() {
  const { providers, fetchProviders } = useProviders();
  const { results, scan } = useDiscovery();
  const { history, fetchHistory } = useSync();

  useEffect(() => {
    fetchProviders();
    scan();
    fetchHistory(5);
  }, [fetchProviders, scan, fetchHistory]);

  const installedCount = results.filter((r) => r.status === "Installed").length;
  const todaySuccessCount = history.filter((r) => r.result === "Success").length;

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <div className="eyebrow">MVP dashboard</div>
          <h1>Local credentials, connector sync, and safety checks in one place.</h1>
          <p>
            This first batch keeps the scope tight: validate keys, discover local
            tools, preview config changes, and write safely with backup-first flows.
          </p>
        </div>
        <div className="hero-metrics">
          <div>
            <strong>{providers.length}</strong>
            <span>Provider slots</span>
          </div>
          <div>
            <strong>{installedCount}</strong>
            <span>Detected clients</span>
          </div>
          <div>
            <strong>{todaySuccessCount}</strong>
            <span>Successful syncs</span>
          </div>
        </div>
      </section>

      <div className="two-column-grid">
        <SectionCard
          title="Provider health"
          description="A quick scan of key readiness and model coverage."
        >
          {providers.length === 0 ? (
            <p>No providers configured yet.</p>
          ) : (
            <div className="list-stack">
              {providers.map((provider) => (
                <article key={provider.providerId} className="list-row">
                  <div>
                    <strong>{provider.providerId}</strong>
                    <p>{provider.selectedModels.join(", ") || "No models selected"}</p>
                  </div>
                  <StatusPill
                    label={provider.apiKey ? "Configured" : "No key"}
                    tone={provider.apiKey ? "good" : "neutral"}
                  />
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Local discovery"
          description="Surface what is installed before touching any config."
        >
          {results.length === 0 ? (
            <p>No connectors scanned yet.</p>
          ) : (
            <div className="list-stack">
              {results.map((r) => (
                <article key={r.connectorId} className="list-row">
                  <div>
                    <strong>{r.displayName}</strong>
                    {r.detail?.configPaths?.[0] && <p>{r.detail.configPaths[0]}</p>}
                  </div>
                  <StatusPill label={r.status} tone={discoveryTone(r.status)} />
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Recent sync activity"
        description="Make writes transparent with previews, backups, and post-write feedback."
      >
        {history.length === 0 ? (
          <p>No sync history yet.</p>
        ) : (
          <div className="list-stack">
            {history.map((record) => (
              <article key={record.id} className="list-row">
                <div>
                  <strong>{record.connectorId}</strong>
                  <p>{record.changesSummary}</p>
                </div>
                <StatusPill label={record.result} tone={outcomeTone(record.result)} />
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
