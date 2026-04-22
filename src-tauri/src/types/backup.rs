use serde::{Deserialize, Serialize};

/// 备份记录
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct BackupRecord {
    pub path: String,
    pub connector_id: String,
    pub timestamp: String,
    pub size_bytes: u64,
}
