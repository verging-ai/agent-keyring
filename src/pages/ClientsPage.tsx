import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
import { detectedClients } from "../data/mock";

export function ClientsPage() {
  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <div className="eyebrow">Clients</div>
          <h1>Detect local AI tools before any connector writes happen.</h1>
          <p>
            This page is the home for install detection, connector support status,
            and per-client configuration contracts.
          </p>
        </div>
      </header>

      <SectionCard
        title="Detected and candidate tools"
        description="Keep supported connectors explicit so users understand exactly what AgentKeyring can touch."
      >
        <div className="list-stack">
          {detectedClients.map((client) => (
            <article key={client.name} className="list-row list-row-detailed">
              <div>
                <strong>{client.name}</strong>
                <p>{client.location}</p>
              </div>
              <div className="client-meta">
                <span>{client.action}</span>
                <StatusPill label={client.status} tone={client.tone} />
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Connector contract placeholders"
        description="A connector should know where config lives, what fields it owns, and how to back up before write."
      >
        <div className="check-grid">
          <div className="check-item">Path resolver and install verification</div>
          <div className="check-item">Read current config into a normalized shape</div>
          <div className="check-item">Preview write diff before applying changes</div>
          <div className="check-item">Backup and rollback metadata</div>
        </div>
      </SectionCard>
    </div>
  );
}

