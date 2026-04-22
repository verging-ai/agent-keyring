type StatusTone = "good" | "warn" | "neutral";

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
};

export function StatusPill({ label, tone = "neutral" }: StatusPillProps) {
  return <span className={`status-pill status-${tone}`}>{label}</span>;
}

