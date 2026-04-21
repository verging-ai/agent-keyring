# AgentKeyring MVP Foundation

This document captures the recommended initialization structure, stack, and page skeleton for the current project scope described in `README.md`.

## Recommended stack

### Desktop shell

- `Tauri`
- Why: local-first distribution, direct filesystem access with a tighter footprint than Electron, and a good fit for desktop configuration tools

### Frontend

- `React + TypeScript + Vite`
- Why: fast iteration for an early product, good component ergonomics for settings-heavy UIs, and an easy path from mocked skeletons to real stateful flows

### Routing

- `react-router-dom`
- Why: the MVP already has distinct top-level surfaces such as providers, clients, sync, and settings

### State and data

- Start simple with local component state
- Add a small store only when provider forms, detection state, and sync sessions begin crossing page boundaries
- Good next addition when needed: `zustand`

### Styling

- Plain CSS for the first pass
- Why: the current project needs clear information architecture more than a large design system

### Native responsibilities to add next

- secure secret storage
- local filesystem read and write adapters
- provider validation commands
- installed client detection
- backup and rollback support

## Suggested repository structure

```text
agent-keyring/
  docs/
    mvp-foundation.md
  src/
    app/
      App.tsx
    components/
      layout/
      ui/
    data/
      mock.ts
    pages/
      DashboardPage.tsx
      ProvidersPage.tsx
      ClientsPage.tsx
      SyncPage.tsx
      SettingsPage.tsx
    styles/
      global.css
    main.tsx
  src-tauri/
    src/
      main.rs
    capabilities/
      default.json
    Cargo.toml
    tauri.conf.json
  index.html
  package.json
  tsconfig.app.json
  tsconfig.node.json
  vite.config.ts
```

## First batch of pages

### 1. Overview

- dashboard summary
- provider health snapshot
- local tool discovery snapshot
- recent sync results

### 2. Providers

- add or edit provider credentials
- validate key
- refresh model list
- show provider-specific capability state

### 3. Clients

- detect installed AI tools
- show connector support status
- explain what config each connector owns

### 4. Sync

- select provider to sync
- pick target client
- preview changes
- back up current config
- apply and verify

### 5. Settings

- backup directory
- retention policy
- secret storage strategy
- diagnostics controls

## MVP boundary reminders

Keep these out of the first implementation pass:

- hosted accounts
- multi-user SaaS concepts
- gateway traffic relay
- prompt or chat surfaces
- large plugin ecosystems before core connectors are stable

## Recommended implementation order

1. Tauri shell and filesystem bridge
2. provider key storage and validation
3. client detection contracts
4. dry-run sync preview
5. backup and rollback history

