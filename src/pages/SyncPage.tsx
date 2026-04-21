import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
import { syncRuns } from "../data/mock";

export function SyncPage() {
  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <div className="eyebrow">Sync</div>
          <h1>Make every config change previewable, reversible, and understandable.</h1>
          <p>
            The MVP sync flow should guide users through target selection, diff
            preview, backup, apply, and result reporting.
          </p>
        </div>
      </header>

      <div className="two-column-grid">
        <SectionCard
          title="Sync flow"
          description="This skeleton can turn into a stepper once real connector actions exist."
        >
          <div className="timeline">
            <div className="timeline-item">1. Pick provider and destination client</div>
            <div className="timeline-item">2. Inspect current config and backup plan</div>
            <div className="timeline-item">3. Preview generated changes</div>
            <div className="timeline-item">4. Apply write and verify result</div>
          </div>
        </SectionCard>

        <SectionCard
          title="Safety defaults"
          description="These are strong defaults for a local-first configuration tool."
        >
          <div className="check-grid">
            <div className="check-item">Dry run before destructive writes</div>
            <div className="check-item">Timestamped backup for every applied sync</div>
            <div className="check-item">Clear field ownership per connector</div>
            <div className="check-item">Plain-language success and failure output</div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Recent runs"
        description="Users should always be able to understand what happened and why."
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

