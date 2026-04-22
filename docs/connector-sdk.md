# Connector SDK Guide

This guide explains how to add a new Connector to AgentKeyring. A Connector integrates a local AI tool (e.g., Cursor, Continue, Aider) so that AgentKeyring can detect it, read its configuration, sync API keys into it, and roll back if something goes wrong.

## Overview

Adding a Connector requires two steps:

1. Create a Rust file implementing the `Connector` trait
2. Register it with one line in `ConnectorRegistry::new()`

No changes to the frontend, command handlers, or other connectors are needed.

## The Connector Trait

The full trait is defined in `src-tauri/src/adapters/connector_trait.rs`:

```rust
pub trait Connector: Send + Sync {
    /// Returns the connector's metadata.
    fn meta(&self) -> &ConnectorMeta;

    /// Detects whether the target AI tool is installed on the local system.
    fn detect(&self) -> ConnectorResult<DetectResult>;

    /// Reads the current configuration of the target AI tool.
    fn read_config(&self) -> ConnectorResult<serde_json::Value>;

    /// Generates a sync plan describing what changes would be applied.
    fn plan_sync(&self, provider_config: &ProviderConfig) -> ConnectorResult<SyncPlan>;

    /// Applies the sync plan, writing configuration changes to the target tool.
    fn apply_sync(&self, plan: &SyncPlan) -> ConnectorResult<()>;

    /// Creates a backup of the current configuration. Returns the backup file path.
    fn backup(&self) -> ConnectorResult<String>;

    /// Rolls back to a previous backup.
    fn rollback(&self, backup_path: &str) -> ConnectorResult<()>;
}
```

## Types Reference

### ConnectorMeta

Metadata that identifies your connector:

```rust
pub struct ConnectorMeta {
    pub id: String,                    // Unique identifier, e.g. "cursor"
    pub display_name: String,          // Human-readable name, e.g. "Cursor"
    pub config_path_patterns: Vec<String>, // Config file paths, e.g. ["~/.cursor/config.json"]
    pub version: String,               // Connector version, e.g. "0.1.0"
}
```

### DetectResult

Returned by `detect()`:

```rust
pub struct DetectResult {
    pub installed: bool,           // Whether the tool is installed
    pub version: Option<String>,   // Detected tool version (if available)
    pub config_paths: Vec<String>, // Actual config file paths found
}
```

### SyncChange / SyncPlan

Returned by `plan_sync()` to describe what will change:

```rust
pub struct SyncChange {
    pub path: String,              // Config file path
    pub field: String,             // Field being changed (e.g. "apiKey")
    pub old_value: Option<String>, // Previous value (None if new)
    pub new_value: String,         // Value to write
    pub change_type: ChangeType,   // Add, Update, or Remove
}

pub enum ChangeType { Add, Update, Remove }

pub struct SyncPlan {
    pub connector_id: String,
    pub provider_id: String,
    pub changes: Vec<SyncChange>,
    pub timestamp: String,
}
```

### ConnectorResult\<T\>

All trait methods return `ConnectorResult<T>` instead of `Result`. Use the helper constructors:

```rust
// Success
ConnectorResult::ok(data)

// Failure
ConnectorResult::err("ERROR_CODE", "Human-readable message")
```

### ProviderConfig

Passed to `plan_sync()` — contains the provider's API key and settings:

```rust
pub struct ProviderConfig {
    pub provider_id: String,
    pub api_key: String,
    pub base_url: Option<String>,
    pub selected_models: Vec<String>,
}
```

## Minimal Example: CursorConnector

Create `src-tauri/src/adapters/connectors/cursor.rs`:

```rust
use std::fs;
use std::path::PathBuf;

use crate::adapters::Connector;
use crate::types::{
    ChangeType, ConnectorMeta, ConnectorResult, DetectResult,
    ProviderConfig, SyncChange, SyncPlan,
};

pub struct CursorConnector {
    meta: ConnectorMeta,
}

impl CursorConnector {
    pub fn new() -> Self {
        Self {
            meta: ConnectorMeta {
                id: "cursor".to_string(),
                display_name: "Cursor".to_string(),
                config_path_patterns: vec!["~/.cursor/config.json".to_string()],
                version: "0.1.0".to_string(),
            },
        }
    }

    fn config_path(&self) -> PathBuf {
        dirs::home_dir()
            .unwrap_or_default()
            .join(".cursor")
            .join("config.json")
    }
}

impl Connector for CursorConnector {
    fn meta(&self) -> &ConnectorMeta {
        &self.meta
    }

    fn detect(&self) -> ConnectorResult<DetectResult> {
        let path = self.config_path();
        let installed = path.exists();
        ConnectorResult::ok(DetectResult {
            installed,
            version: None,
            config_paths: if installed {
                vec![path.to_string_lossy().into_owned()]
            } else {
                vec![]
            },
        })
    }

    fn read_config(&self) -> ConnectorResult<serde_json::Value> {
        let path = self.config_path();
        match fs::read_to_string(&path) {
            Ok(content) => match serde_json::from_str(&content) {
                Ok(val) => ConnectorResult::ok(val),
                Err(e) => ConnectorResult::err("CONFIG_PARSE_ERROR", e.to_string()),
            },
            Err(e) => ConnectorResult::err("CONFIG_READ_ERROR", e.to_string()),
        }
    }

    fn plan_sync(&self, provider_config: &ProviderConfig) -> ConnectorResult<SyncPlan> {
        // Read current config to determine old value
        let old_key = match self.read_config() {
            ConnectorResult::Ok { data, .. } => {
                data.get("apiKey").and_then(|v| v.as_str()).map(String::from)
            }
            _ => None,
        };

        let change_type = if old_key.is_some() { ChangeType::Update } else { ChangeType::Add };

        ConnectorResult::ok(SyncPlan {
            connector_id: self.meta.id.clone(),
            provider_id: provider_config.provider_id.clone(),
            changes: vec![SyncChange {
                path: self.config_path().to_string_lossy().into_owned(),
                field: "apiKey".to_string(),
                old_value: old_key,
                new_value: provider_config.api_key.clone(),
                change_type,
            }],
            timestamp: chrono::Utc::now().to_rfc3339(),
        })
    }

    fn apply_sync(&self, plan: &SyncPlan) -> ConnectorResult<()> {
        let path = self.config_path();

        // Read existing config or start fresh
        let mut config: serde_json::Value = fs::read_to_string(&path)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_else(|| serde_json::json!({}));

        // Apply each change
        for change in &plan.changes {
            if let serde_json::Value::Object(ref mut map) = config {
                match change.change_type {
                    ChangeType::Remove => { map.remove(&change.field); }
                    _ => { map.insert(change.field.clone(), serde_json::json!(change.new_value)); }
                }
            }
        }

        // Write back
        let content = serde_json::to_string_pretty(&config)
            .map_err(|e| e.to_string());
        match content {
            Ok(json) => match fs::write(&path, json) {
                Ok(_) => ConnectorResult::ok(()),
                Err(e) => ConnectorResult::err("CONNECTOR_WRITE_FAILED", e.to_string()),
            },
            Err(e) => ConnectorResult::err("CONNECTOR_SERIALIZE_ERROR", e),
        }
    }

    fn backup(&self) -> ConnectorResult<String> {
        let path = self.config_path();
        if !path.exists() {
            return ConnectorResult::err("CONFIG_NOT_FOUND", "No config file to back up");
        }
        // The BackupManager handles the actual copy — return the source path
        // so the SyncEngine can coordinate.
        ConnectorResult::ok(path.to_string_lossy().into_owned())
    }

    fn rollback(&self, backup_path: &str) -> ConnectorResult<()> {
        let target = self.config_path();
        match fs::copy(backup_path, &target) {
            Ok(_) => ConnectorResult::ok(()),
            Err(e) => ConnectorResult::err("ROLLBACK_FAILED", e.to_string()),
        }
    }
}
```

## Registration

Open `src-tauri/src/adapters/connectors/mod.rs` and add:

```rust
pub mod cursor;
pub use cursor::CursorConnector;
```

Then open `src-tauri/src/services/connector_registry.rs` and add one line inside `ConnectorRegistry::new()`:

```rust
impl ConnectorRegistry {
    pub fn new() -> Self {
        let mut registry = Self { connectors: Vec::new() };
        registry.register(Box::new(CodexCliConnector::new()));
        registry.register(Box::new(ClaudeCodeConnector::new()));
        registry.register(Box::new(CursorConnector::new()));  // ← add this
        registry
    }
}
```

That's it. The new connector will automatically appear in discovery scans, the Clients page, and sync operations.

## How the SyncEngine Uses Your Connector

When a user triggers a sync, the `SyncEngine` calls your connector methods in this exact order:

1. `read_config()` — verify the tool's config is accessible
2. `plan_sync(provider_config)` — generate a preview of changes
3. `backup()` — create a backup before writing
4. `apply_sync(plan)` — write the changes

If `apply_sync()` fails, the engine automatically calls `rollback(backup_path)` to restore the backup.

## Error Handling Guidelines

- Always return `ConnectorResult::err(code, message)` instead of panicking
- Use descriptive error codes with a `CONNECTOR_` prefix (e.g., `CONNECTOR_WRITE_FAILED`)
- The error message should be human-readable — it gets displayed in the UI
- If `detect()` takes longer than 5 seconds, the DiscoveryService marks it as `DetectTimeout`

## Checklist

- [ ] Struct implements `Connector` trait with all 7 methods
- [ ] `ConnectorMeta.id` is unique and kebab-case
- [ ] `detect()` returns quickly (under 5 seconds)
- [ ] `plan_sync()` accurately describes changes before they happen
- [ ] `apply_sync()` is idempotent when possible
- [ ] `backup()` and `rollback()` handle missing files gracefully
- [ ] Module added to `connectors/mod.rs`
- [ ] One-line registration in `ConnectorRegistry::new()`
