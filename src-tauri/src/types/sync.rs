use serde::{Deserialize, Serialize};

use super::connector::ErrorInfo;

/// 同步操作结果枚举
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SyncOutcome {
    Success,
    Failed,
    RolledBack,
}

/// 同步记录
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct SyncRecord {
    pub id: String,
    pub timestamp: String,
    pub connector_id: String,
    pub provider_id: String,
    pub result: SyncOutcome,
    pub changes_summary: String,
    pub backup_path: Option<String>,
}

/// 同步结果
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SyncResult {
    pub outcome: SyncOutcome,
    pub record: SyncRecord,
    pub error: Option<ErrorInfo>,
}
