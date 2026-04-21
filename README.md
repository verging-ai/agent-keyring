# AgentKeyring

An open-source desktop tool for managing LLM API keys and syncing them into local AI agents and clients.

## Why AgentKeyring

Using AI tools locally often means dealing with the same setup problems again and again:

- copying API keys into different tools
- figuring out where config files live
- switching between providers and models
- editing env vars or JSON/YAML by hand
- debugging why a tool still does not work

For many users, this setup friction is much harder than it should be.

AgentKeyring is built to make that experience simpler.

## What AgentKeyring does

AgentKeyring helps you:

- manage multiple LLM provider API keys in one place
- validate whether a key actually works
- inspect available models for supported providers
- detect supported AI agents and clients installed on your machine
- sync configuration into those tools with fewer manual steps
- reduce repeated edits to env vars and config files

## What AgentKeyring is not

AgentKeyring is **not**:

- a chat client
- a hosted LLM platform
- a proxy gateway
- a replacement for your existing AI tools

It is a **local-first configuration and credential management tool**.

## Core use cases

- Add your OpenAI / Anthropic / other provider keys once
- Verify whether they are valid
- See which local tools can use them
- Sync supported configuration into those tools
- Keep your local LLM setup easier to understand and maintain

## Design goals

- local-first
- simple enough for non-developers
- transparent about what changes were made
- safe by default
- open source from the beginning

## Planned MVP

The first version is expected to focus on:

- multi-provider API key management
- key validation
- model capability detection
- installed tool discovery
- connector-based config sync
- backup before config write
- clear success / failure feedback

## Early target integrations

Initial integrations will likely focus on a small number of common tools first, rather than trying to support everything at once.

Planned categories include:

- agent CLI tools
- coding assistants
- editor / note-taking integrations
- common config export targets

## Project status

AgentKeyring is in early planning and build-in-public mode.

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

## License

Licensed under the [Apache License 2.0](LICENSE).

