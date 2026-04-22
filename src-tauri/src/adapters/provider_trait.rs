use crate::types::{
    ConnectorResult, KeyValidationResult, ModelInfo, ProviderCapabilities, ProviderMeta,
};

/// Provider Adapter — all Provider implementations must implement this trait.
/// Each Provider represents an LLM service (e.g., OpenAI, Anthropic).
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
