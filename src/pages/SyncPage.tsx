import { useEffect } from "react";
import { SectionCard } from "../shared/ui/SectionCard";
import { StatusPill } from "../shared/ui/StatusPill";
import { useSync } from "../features/sync";
import type { SyncOutcome } from "../shared/types";

function outcomeTone(outcome: SyncOutcome): "good" | "warn" | "neutral" {
  if (outcome === "Success") return "good";
  if (outcome === "Failed" || outcome === "RolledBack") return "warn";
  return "neutral";
}

export function SyncPage() {
  const {
    step,
    plan,
    result,
    history,
    error,
    preparePlan,
    confirmSync,
    fetchHistory,
    reset,
  } = useSync();

  useEffect(() => {
    fetchHistory(20);
  }, [fetchHistory]);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <div className="eyebrow">Sync</div>
          <h1>
            Make every config change previewable, reversible, and
            understandable.
          </h1>
          <p>
            Select a provider and connector, preview changes, then apply with
            automatic backup.
          </p>
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert">{error}</div>
      )}

      <div className="two-column-grid">
        <SectionCard
          title="Sync flow"
          description="Current sync step and progress."
        >
          <div className="timeline">
            <div className={`timeline-item ${step === "planning" ? "active" : ""}`}>
              1. Pick provider and destination client
            </div>
            <div className={`timeline-item ${step === "previewing" ? "active" : ""}`}>
              2. Preview generated changes
            </div>
            <div className={`timeline-item ${step === "syncing" ? "active" : ""}`}>
              3. Backup and apply write
            </div>
            <div className={`timeline-item ${step === "done" ? "active" : ""}`}>
              4. Verify result
            </div>
          </div>

          {step === "previewing" && plan && (
            <div className="sync-preview">
              <h3>Changes for {plan.connectorId}</h3>
              <ul>
                {plan.changes.map((c, i) => (
                  <li key={i}>
                    <span className="soft-tag">{c.changeType}</span>{" "}
                    {c.field}: {c.oldValue ?? "(none)"} → {c.newValue}
                  </li>
                ))}
              </ul>
              <div className="button-row">
                <button type="button" onClick={confirmSync}>
                  Confirm &amp; Apply
                </button>
                <button type="button" className="button-secondary" onClick={reset}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === "syncing" && <p>Syncing… please wait.</p>}

          {step === "done" && result && (
            <div className="sync-result">
              <StatusPill
                label={result.outcome}
                tone={outcomeTone(result.outcome)}
              />
              <p>{result.record.changesSummary}</p>
              <button type="button" onClick={reset}>
                Start new sync
              </button>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Safety defaults"
          description="Strong defaults for a local-first configuration tool."
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
                <StatusPill
                  label={record.result}
                  tone={outcomeTone(record.result)}
                />
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
