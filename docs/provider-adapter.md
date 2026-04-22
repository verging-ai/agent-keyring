# Provider Adapter Guide

This guide explains how to add a new LLM Provider to AgentKeyring. A Provider Adapter integrates an LLM service (e.g., Google Gemini, Mistral, Groq) so that AgentKeyring can validate API keys, list available models, and report provider capabilities.

## Overview

Adding a Provider requires two steps:

1. Create a Rust file implementing the `ProviderAdapter` trait
2. Register it in `ProviderRegistry::new()`

No changes to the sync engine, frontend, or other providers are needed.

## The ProviderAdapter Trait

Defined in `src-tauri/src/adapters/provider_trait.rs`:

```rust
pub trait ProviderAdapter: Send + Sync {
    /// Returns the provider's metadata (id, display name, auth methods).
    fn meta(&self) -> &ProviderMeta;

    /// Validates an API key, returning a structured result with status.
    fn validate_key(&self, api_key: &str) -> ConnectorResult<KeyValidationResult>;

    /// Lists available models for the given API key.
    fn list_models(&self, api_key: &str) -> ConnectorResult<Vec<ModelInfo>>;

    /// Returns the provider's capability description.
    fn get_capabilities(&self) -> ConnectorResult<ProviderCapabilities>;
}
```

## Types Reference

### ProviderMeta

```rust
pub struct ProviderMeta {
    pub id: String,              // Unique identifier, e.g. "gemini"
    pub display_name: String,    // Human-readable name, e.g. "Google Gemini"
    pub auth_methods: Vec<String>, // e.g. ["api_key"]
}
```

### KeyValidationResult / KeyValidationStatus

```rust
pub enum KeyValidationStatus {
    Valid,
    Invalid,
    Expired,
    RateLimited,
}

pub struct KeyValidationResult {
    pub status: KeyValidationStatus,
    pub error: Option<String>,     // Human-readable error description
}
```

### ModelInfo

```rust
pub struct ModelInfo {
    pub id: String,                // e.g. "gemini-2.0-flash"
    pub display_name: String,      // e.g. "Gemini 2.0 Flash"
    pub capabilities: Vec<String>, // e.g. ["chat", "code", "vision"]
}
```

### ProviderCapabilities

```rust
pub struct ProviderCapabilities {
    pub supports_streaming: bool,
    pub supports_tool_use: bool,
    pub max_context_window: u64,   // Token count
}
```

### ConnectorResult\<T\>

All trait methods return `ConnectorResult<T>`. Use the helper constructors:

```rust
ConnectorResult::ok(data)
ConnectorResult::err("ERROR_CODE", "Human-readable message")
```

## Minimal Example: GeminiProvider

Create `src-tauri/src/adapters/providers/gemini.rs`:

```rust
use crate::adapters::ProviderAdapter;
use crate::types::{
    ConnectorResult, KeyValidationResult, KeyValidationStatus,
    ModelInfo, ProviderCapabilities, ProviderMeta,
};

pub struct GeminiProvider {
    meta: ProviderMeta,
}

impl GeminiProvider {
    pub fn new() -> Self {
        Self {
            meta: ProviderMeta {
                id: "gemini".to_string(),
                display_name: "Google Gemini".to_string(),
                auth_methods: vec!["api_key".to_string()],
            },
        }
    }
}

impl ProviderAdapter for GeminiProvider {
    fn meta(&self) -> &ProviderMeta {
        &self.meta
    }

    fn validate_key(&self, api_key: &str) -> ConnectorResult<KeyValidationResult> {
        if api_key.is_empty() {
            return ConnectorResult::ok(KeyValidationResult {
                status: KeyValidationStatus::Invalid,
                error: Some("API key cannot be empty".to_string()),
            });
        }

        // In a real implementation, make an HTTP request to the Gemini API
        // to verify the key. For now, return valid as a stub.
        ConnectorResult::ok(KeyValidationResult {
            status: KeyValidationStatus::Valid,
            error: None,
        })
    }

    fn list_models(&self, _api_key: &str) -> ConnectorResult<Vec<ModelInfo>> {
        // In a real implementation, call the Gemini API to fetch models.
        ConnectorResult::ok(vec![
            ModelInfo {
                id: "gemini-2.0-flash".to_string(),
                display_name: "Gemini 2.0 Flash".to_string(),
                capabilities: vec![
                    "chat".to_string(),
                    "code".to_string(),
                    "vision".to_string(),
                ],
            },
            ModelInfo {
                id: "gemini-2.0-pro".to_string(),
                display_name: "Gemini 2.0 Pro".to_string(),
                capabilities: vec!["chat".to_string(), "code".to_string()],
            },
        ])
    }

    fn get_capabilities(&self) -> ConnectorResult<ProviderCapabilities> {
        ConnectorResult::ok(ProviderCapabilities {
            supports_streaming: true,
            supports_tool_use: true,
            max_context_window: 1_000_000,
        })
    }
}
```

## Registration

Open `src-tauri/src/adapters/providers/mod.rs` and add:

```rust
pub mod gemini;
pub use gemini::GeminiProvider;
```

Then open `src-tauri/src/services/provider_registry.rs` and add one line inside `ProviderRegistry::new()`:

```rust
impl ProviderRegistry {
    pub fn new() -> Self {
        let mut registry = Self { providers: Vec::new() };
        registry.register(Box::new(OpenAiProvider::new()));
        registry.register(Box::new(AnthropicProvider::new()));
        registry.register(Box::new(GeminiProvider::new()));  // ← add this
        registry
    }
}
```

Done. The new provider will be available for key validation, model listing, and sync operations.

## Error Handling Guidelines

- Never panic — always return `ConnectorResult::err(code, message)`
- Use `PROVIDER_` prefixed error codes (e.g., `PROVIDER_NETWORK_ERROR`, `PROVIDER_RATE_LIMITED`)
- `validate_key()` must always return a structured `KeyValidationResult`, even on network failure:
  ```rust
  // Network error example — don't propagate the raw error
  ConnectorResult::err("PROVIDER_NETWORK_ERROR", "Failed to reach Gemini API")
  ```
- The error message is shown directly to users in the UI, so keep it clear and actionable

## Checklist

- [ ] Struct implements `ProviderAdapter` with all 4 methods
- [ ] `ProviderMeta.id` is unique and lowercase
- [ ] `validate_key()` handles empty keys, network errors, and rate limits gracefully
- [ ] `list_models()` returns models with `id`, `displayName`, and `capabilities`
- [ ] `get_capabilities()` accurately reflects the provider's features
- [ ] Module added to `providers/mod.rs`
- [ ] One-line registration in `ProviderRegistry::new()`
