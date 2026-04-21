import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
import { detectedClients, providerAccounts, syncRuns } from "../data/mock";

export function DashboardPage() {
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
            <strong>3</strong>
            <span>Provider slots</span>
          </div>
          <div>
            <strong>3</strong>
            <span>Client targets</span>
          </div>
          <div>
            <strong>1</strong>
            <span>Successful sync today</span>
          </div>
        </div>
      </section>

      <div className="two-column-grid">
        <SectionCard
          title="Provider health"
          description="A quick scan of key readiness and model coverage."
        >
          <div className="list-stack">
            {providerAccounts.map((provider) => (
              <article key={provider.name} className="list-row">
                <div>
                  <strong>{provider.name}</strong>
                  <p>{provider.note}</p>
                </div>
                <StatusPill label={provider.status} tone={provider.tone} />
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Local discovery"
          description="Surface what is installed before touching any config."
        >
          <div className="list-stack">
            {detectedClients.map((client) => (
              <article key={client.name} className="list-row">
                <div>
                  <strong>{client.name}</strong>
                  <p>{client.location}</p>
                </div>
                <StatusPill label={client.status} tone={client.tone} />
              </article>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Recent sync activity"
        description="Make writes transparent with previews, backups, and post-write feedback."
      >
        <div className="list-stack">
          {syncRuns.map((run) => (
            <article key={run.target} className="list-row">
              <div>
                <strong>{run.target}</strong>
                <p>{run.detail}</p>
              </div>
              <StatusPill label={run.result} tone={run.tone} />
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

