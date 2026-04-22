use serde::{Deserialize, Serialize};

/// Provider 元数据
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ProviderMeta {
    pub id: String,
    pub display_name: String,
    pub auth_methods: Vec<String>,
}

/// Provider 配置（存储的 key 信息）
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ProviderConfig {
    pub provider_id: String,
    pub api_key: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub base_url: Option<String>,
    pub selected_models: Vec<String>,
}

/// Key 验证状态
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum KeyValidationStatus {
    Valid,
    Invalid,
    Expired,
    RateLimited,
}

/// Key 验证结果
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct KeyValidationResult {
    pub status: KeyValidationStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

/// 模型信息
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ModelInfo {
    pub id: String,
    pub display_name: String,
    pub capabilities: Vec<String>,
}

/// Provider 能力描述
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ProviderCapabilities {
    pub supports_streaming: bool,
    pub supports_tool_use: bool,
    pub max_context_window: u64,
}
