use crate::adapters::ProviderAdapter;
use crate::types::{
    ConnectorResult, KeyValidationResult, KeyValidationStatus, ModelInfo, ProviderCapabilities,
    ProviderMeta,
};

pub struct AnthropicProvider {
    meta: ProviderMeta,
}

impl AnthropicProvider {
    pub fn new() -> Self {
        Self {
            meta: ProviderMeta {
                id: "anthropic".to_string(),
                display_name: "Anthropic".to_string(),
                auth_methods: vec!["api_key".to_string()],
            },
        }
    }
}

impl ProviderAdapter for AnthropicProvider {
    fn meta(&self) -> &ProviderMeta {
        &self.meta
    }

    fn validate_key(&self, _api_key: &str) -> ConnectorResult<KeyValidationResult> {
        // Stub: always return valid
        ConnectorResult::ok(KeyValidationResult {
            status: KeyValidationStatus::Valid,
            error: None,
        })
    }

    fn list_models(&self, _api_key: &str) -> ConnectorResult<Vec<ModelInfo>> {
        // Stub: return a sample model list
        ConnectorResult::ok(vec![
            ModelInfo {
                id: "claude-sonnet-4-20250514".to_string(),
                display_name: "Claude Sonnet 4".to_string(),
                capabilities: vec!["chat".to_string(), "code".to_string(), "vision".to_string()],
            },
            ModelInfo {
                id: "claude-haiku-3-5".to_string(),
                display_name: "Claude 3.5 Haiku".to_string(),
                capabilities: vec!["chat".to_string(), "code".to_string()],
            },
        ])
    }

    fn get_capabilities(&self) -> ConnectorResult<ProviderCapabilities> {
        ConnectorResult::ok(ProviderCapabilities {
            supports_streaming: true,
            supports_tool_use: true,
            max_context_window: 200_000,
        })
    }
}
