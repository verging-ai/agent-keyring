# AgentKeyring

Manage LLM API keys once, validate them, and sync them into your local AI tools safely.

AgentKeyring is an open-source, local-first desktop app for reducing the setup friction around AI agents, coding assistants, and other local AI clients.

## Why This Exists

Using AI tools locally often means repeating the same setup work:

- copying API keys into different tools
- figuring out where config files live
- switching between providers and models
- editing `.env`, JSON, or YAML by hand
- debugging why a tool still does not work

For many users, this setup friction is much harder than it should be.

AgentKeyring is built to make that experience simpler, safer, and easier to understand.

## What It Does

AgentKeyring helps you:

- manage multiple LLM provider API keys in one place
- validate whether a key actually works
- inspect available models for supported providers
- detect supported AI agents and clients installed on your machine
- sync configuration into those tools with fewer manual steps
- reduce repeated edits to env vars and config files

## What It Is Not

AgentKeyring is **not**:

- a chat client
- a hosted LLM platform
- a proxy gateway
- a replacement for your existing AI tools

It is a **local-first configuration and credential management tool**.

## Core Workflow

The intended workflow is simple:

1. Add your OpenAI, Anthropic, or other provider keys once.
2. Verify that the keys are valid.
3. Detect which supported local tools are installed.
4. Preview what configuration changes would be made.
5. Back up current config before writing anything.
6. Sync supported settings into the target tool.

## Why Local-First Matters

AgentKeyring is designed around a few practical principles:

- your local AI setup should be easier to manage, not harder
- config writes should be transparent and reversible
- users should understand what changed and why
- safety should come before convenience
- open source should make the behavior inspectable

## Planned MVP

The first version is expected to focus on:

- multi-provider API key management
- key validation
- model capability detection
- installed tool discovery
- connector-based config sync
- backup before config write
- clear success and failure feedback

## Early Target Integrations

The first release should stay focused on a small number of useful targets instead of trying to support everything at once.

Planned categories include:

- agent CLI tools
- coding assistants
- editor and note-taking integrations
- common config export targets

The long-term goal is to support more tools through a clear connector model, but the initial release should stay narrow and reliable.

## Project Status

AgentKeyring is currently in early planning and build-in-public mode.

Current priorities:

1. define the MVP clearly
2. choose the first supported integrations
3. validate setup pain points with real users
4. build a working local-first desktop prototype

## Contributing

Feedback, issues, and early discussion are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

At this stage, the most useful contributions are:

- sharing setup pain points
- suggesting high-value integrations
- reporting configuration workflows that are too confusing
- helping validate the MVP scope

If you are interested in contributing later, likely high-leverage areas will include:

- provider adapters
- tool connectors
- config detection rules
- backup and rollback flows
- UX improvements for setup clarity

## Roadmap Direction

The short-term goal is not to build a large platform.

The goal is to make local AI configuration less painful for real users by solving a narrow, common, repeated problem well:

- enter keys once
- detect local tools
- sync safely
- explain results clearly

If that workflow becomes genuinely useful, the project can expand from there.

## License

Licensed under the [Apache License 2.0](LICENSE).
