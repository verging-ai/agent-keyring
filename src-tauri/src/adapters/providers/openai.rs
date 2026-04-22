use crate::adapters::ProviderAdapter;
use crate::types::{
    ConnectorResult, KeyValidationResult, KeyValidationStatus, ModelInfo, ProviderCapabilities,
    ProviderMeta,
};

pub struct OpenAiProvider {
    meta: ProviderMeta,
}

impl OpenAiProvider {
    pub fn new() -> Self {
        Self {
            meta: ProviderMeta {
                id: "openai".to_string(),
                display_name: "OpenAI".to_string(),
                auth_methods: vec!["api_key".to_string()],
            },
        }
    }
}

impl ProviderAdapter for OpenAiProvider {
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
                id: "gpt-4o".to_string(),
                display_name: "GPT-4o".to_string(),
                capabilities: vec!["chat".to_string(), "code".to_string(), "vision".to_string()],
            },
            ModelInfo {
                id: "gpt-4o-mini".to_string(),
                display_name: "GPT-4o Mini".to_string(),
                capabilities: vec!["chat".to_string(), "code".to_string()],
            },
        ])
    }

    fn get_capabilities(&self) -> ConnectorResult<ProviderCapabilities> {
        ConnectorResult::ok(ProviderCapabilities {
            supports_streaming: true,
            supports_tool_use: true,
            max_context_window: 128_000,
        })
    }
}
