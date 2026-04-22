import { useEffect } from "react";
import { SectionCard } from "../shared/ui/SectionCard";
import { StatusPill } from "../shared/ui/StatusPill";
import { useConnectors } from "../features/connectors";
import { useDiscovery } from "../features/discovery";
import type { DiscoveryStatus } from "../shared/types";

function discoveryTone(status: DiscoveryStatus): "good" | "warn" | "neutral" {
  if (status === "Installed") return "good";
  if (status === "DetectFailed" || status === "DetectTimeout") return "warn";
  return "neutral";
}

function discoveryLabel(status: DiscoveryStatus): string {
  switch (status) {
    case "Installed":
      return "Detected";
    case "NotInstalled":
      return "Not installed";
    case "DetectFailed":
      return "Detection failed";
    case "DetectTimeout":
      return "Detection timeout";
  }
}

export function ClientsPage() {
  const { results, scanning, error: discoveryError, scan } = useDiscovery();
  const { connectors, fetchConnectors } = useConnectors();

  useEffect(() => {
    scan();
    fetchConnectors();
  }, [scan, fetchConnectors]);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <div className="eyebrow">Clients</div>
          <h1>Detect local AI tools before any connector writes happen.</h1>
          <p>
            Install detection, connector support status, and per-client
            configuration contracts.
          </p>
        </div>
      </header>

      {discoveryError && (
        <div className="error-banner" role="alert">{discoveryError}</div>
      )}

      <SectionCard
        title="Detected and candidate tools"
        description="Supported connectors are listed with their detection status."
        aside={
          <button type="button" onClick={scan} disabled={scanning}>
            {scanning ? "Scanning…" : "Re-scan"}
          </button>
        }
      >
        {scanning && results.length === 0 ? (
          <p>Scanning local system…</p>
        ) : results.length === 0 ? (
          <p>No connectors registered yet.</p>
        ) : (
          <div className="list-stack">
            {results.map((r) => (
              <article key={r.connectorId} className="list-row list-row-detailed">
                <div>
                  <strong>{r.displayName}</strong>
                  {r.detail?.configPaths?.[0] && <p>{r.detail.configPaths[0]}</p>}
                  {r.detail?.version && <p>v{r.detail.version}</p>}
                </div>
                <div className="client-meta">
                  <StatusPill
                    label={discoveryLabel(r.status)}
                    tone={discoveryTone(r.status)}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
