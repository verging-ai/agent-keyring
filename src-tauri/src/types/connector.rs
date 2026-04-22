use serde::{Deserialize, Serialize};

/// Connector 元数据
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ConnectorMeta {
    pub id: String,
    pub display_name: String,
    pub config_path_patterns: Vec<String>,
    pub version: String,
}

/// 检测结果
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DetectResult {
    pub installed: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub version: Option<String>,
    pub config_paths: Vec<String>,
}

/// 同步计划中的单个变更项
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct SyncChange {
    pub path: String,
    pub field: String,
    pub old_value: Option<String>,
    pub new_value: String,
    pub change_type: ChangeType,
}

/// 变更类型
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ChangeType {
    Add,
    Update,
    Remove,
}

/// 同步计划
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct SyncPlan {
    pub connector_id: String,
    pub provider_id: String,
    pub changes: Vec<SyncChange>,
    pub timestamp: String,
}

/// 错误信息
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ErrorInfo {
    pub code: String,
    pub message: String,
}

/// 操作结果（泛型）
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum ConnectorResult<T> {
    Ok { ok: bool, data: T },
    Err { ok: bool, error: ErrorInfo },
}

impl<T> ConnectorResult<T> {
    pub fn ok(data: T) -> Self {
        ConnectorResult::Ok { ok: true, data }
    }

    pub fn err(code: impl Into<String>, message: impl Into<String>) -> Self {
        ConnectorResult::Err {
            ok: false,
            error: ErrorInfo {
                code: code.into(),
                message: message.into(),
            },
        }
    }
}
