export const providerAccounts = [
  {
    name: "OpenAI",
    status: "Validated 12m ago",
    tone: "good" as const,
    models: ["gpt-4.1", "gpt-4o-mini", "o4-mini"],
    note: "Primary provider for coding assistants."
  },
  {
    name: "Anthropic",
    status: "Needs re-check",
    tone: "warn" as const,
    models: ["claude-3-7-sonnet", "claude-3-5-haiku"],
    note: "Configured, but model list is stale."
  },
  {
    name: "OpenRouter",
    status: "Not connected",
    tone: "neutral" as const,
    models: ["-"],
    note: "Reserved for shared exports and experiments."
  }
];

export const detectedClients = [
  {
    name: "Codex CLI",
    location: "~/.codex",
    status: "Detected",
    tone: "good" as const,
    action: "Ready for connector mapping"
  },
  {
    name: "Claude Code",
    location: "~/.config/claude",
    status: "Detected",
    tone: "good" as const,
    action: "Config path confirmed"
  },
  {
    name: "Cursor",
    location: "~/Library/Application Support/Cursor",
    status: "Candidate",
    tone: "neutral" as const,
    action: "Detection rule not finalized"
  }
];

export const syncRuns = [
  {
    target: "Codex CLI",
    result: "Success",
    tone: "good" as const,
    detail: "Backed up env file and wrote updated provider mapping."
  },
  {
    target: "Claude Code",
    result: "Dry run",
    tone: "neutral" as const,
    detail: "Previewed changes, waiting for connector confirmation."
  },
  {
    target: "Cursor",
    result: "Blocked",
    tone: "warn" as const,
    detail: "Client path detected, but no connector contract yet."
  }
];

