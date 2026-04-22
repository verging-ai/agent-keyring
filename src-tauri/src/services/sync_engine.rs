use std::collections::HashSet;
use std::sync::Mutex;

use crate::services::backup_manager::BackupManager;
use crate::services::ConnectorRegistry;
use crate::types::{
    ConnectorResult, ErrorInfo, ProviderConfig, SyncOutcome, SyncPlan, SyncRecord, SyncResult,
};

/// 同步引擎 — 协调 Provider 和 Connector 之间的配置同步流程。
/// 完整流程：readConfig → planSync → backup → applySync，失败时自动 rollback。
pub struct SyncEngine {
    registry: ConnectorRegistry,
    backup_manager: BackupManager,
    /// Tracks which connectors currently have an active sync to prevent concurrent operations.
    active_syncs: Mutex<HashSet<String>>,
    /// In-memory sync history.
    history: Mutex<Vec<SyncRecord>>,
}

impl SyncEngine {
    pub fn new(registry: ConnectorRegistry, backup_manager: BackupManager) -> Self {
        Self {
            registry,
            backup_manager,
            active_syncs: Mutex::new(HashSet::new()),
            history: Mutex::new(Vec::new()),
        }
    }

    /// Generate a sync plan without executing it.
    pub fn get_plan(
        &self,
        connector_id: &str,
        provider_config: &ProviderConfig,
    ) -> Result<SyncPlan, ErrorInfo> {
        let connector = self.registry.get(connector_id).ok_or_else(|| ErrorInfo {
            code: "CONNECTOR_NOT_FOUND".into(),
            message: format!("Connector '{}' not found in registry", connector_id),
        })?;

        // readConfig first to validate the connector is accessible
        match connector.read_config() {
            ConnectorResult::Err { error, .. } => {
                return Err(ErrorInfo {
                    code: "CONNECTOR_CONFIG_READ_ERROR".into(),
                    message: format!("Failed to read config: {}", error.message),
                });
            }
            _ => {}
        }

        // planSync
        match connector.plan_sync(provider_config) {
            ConnectorResult::Ok { data, .. } => Ok(data),
            ConnectorResult::Err { error, .. } => Err(ErrorInfo {
                code: "SYNC_PLAN_FAILED".into(),
                message: format!("Failed to generate sync plan: {}", error.message),
            }),
        }
    }

    /// Execute the full sync flow for a connector:
    /// readConfig → planSync → backup → applySync
    /// On applySync failure, automatically rollback.
    pub fn execute_sync(
        &self,
        connector_id: &str,
        provider_config: &ProviderConfig,
    ) -> SyncResult {
        // 1. Acquire concurrency lock
        {
            let mut active = self.active_syncs.lock().unwrap();
            if active.contains(connector_id) {
                return self.build_failed_result(
                    connector_id,
                    &provider_config.provider_id,
                    "SYNC_CONCURRENT",
                    &format!(
                        "Connector '{}' already has an active sync operation",
                        connector_id
                    ),
                    None,
                );
            }
            active.insert(connector_id.to_string());
        }

        let result =
            self.execute_sync_inner(connector_id, provider_config);

        // Release concurrency lock
        {
            let mut active = self.active_syncs.lock().unwrap();
            active.remove(connector_id);
        }

        // Record in history
        {
            let mut history = self.history.lock().unwrap();
            history.push(result.record.clone());
        }

        result
    }

    fn execute_sync_inner(
        &self,
        connector_id: &str,
        provider_config: &ProviderConfig,
    ) -> SyncResult {
        let connector = match self.registry.get(connector_id) {
            Some(c) => c,
            None => {
                return self.build_failed_result(
                    connector_id,
                    &provider_config.provider_id,
                    "CONNECTOR_NOT_FOUND",
                    &format!("Connector '{}' not found in registry", connector_id),
                    None,
                );
            }
        };

        // Step 1: readConfig
        if let ConnectorResult::Err { error, .. } = connector.read_config() {
            return self.build_failed_result(
                connector_id,
                &provider_config.provider_id,
                "CONNECTOR_CONFIG_READ_ERROR",
                &format!("Failed to read config: {}", error.message),
                None,
            );
        }

        // Step 2: planSync
        let plan = match connector.plan_sync(provider_config) {
            ConnectorResult::Ok { data, .. } => data,
            ConnectorResult::Err { error, .. } => {
                return self.build_failed_result(
                    connector_id,
                    &provider_config.provider_id,
                    "SYNC_PLAN_FAILED",
                    &format!("Failed to generate sync plan: {}", error.message),
                    None,
                );
            }
        };

        let changes_summary = format!("{} change(s)", plan.changes.len());

        // Step 3: backup
        let backup_path = match connector.backup() {
            ConnectorResult::Ok { data, .. } => data,
            ConnectorResult::Err { error, .. } => {
                return self.build_failed_result(
                    connector_id,
                    &provider_config.provider_id,
                    "SYNC_BACKUP_FAILED",
                    &format!("Failed to create backup: {}", error.message),
                    None,
                );
            }
        };

        // Step 4: applySync — rollback on failure
        if let ConnectorResult::Err { error, .. } = connector.apply_sync(&plan) {
            // Attempt rollback
            let rollback_ok = matches!(
                connector.rollback(&backup_path),
                ConnectorResult::Ok { .. }
            );

            let record = self.build_record(
                connector_id,
                &provider_config.provider_id,
                if rollback_ok {
                    SyncOutcome::RolledBack
                } else {
                    SyncOutcome::Failed
                },
                &changes_summary,
                Some(&backup_path),
            );

            let error_msg = if rollback_ok {
                format!(
                    "Apply failed ({}), rolled back to backup successfully",
                    error.message
                )
            } else {
                format!(
                    "Apply failed ({}) and rollback also failed. Manual recovery may be needed.",
                    error.message
                )
            };

            return SyncResult {
                outcome: record.result.clone(),
                record,
                error: Some(ErrorInfo {
                    code: "SYNC_APPLY_FAILED".into(),
                    message: error_msg,
                }),
            };
        }

        // Success
        let record = self.build_record(
            connector_id,
            &provider_config.provider_id,
            SyncOutcome::Success,
            &changes_summary,
            Some(&backup_path),
        );

        SyncResult {
            outcome: SyncOutcome::Success,
            record,
            error: None,
        }
    }

    /// Returns the sync history, optionally limited to the most recent N records.
    pub fn get_history(&self, limit: Option<usize>) -> Vec<SyncRecord> {
        let history = self.history.lock().unwrap();
        let mut records: Vec<SyncRecord> = history.clone();
        // Newest first
        records.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        if let Some(limit) = limit {
            records.truncate(limit);
        }
        records
    }

    /// Provides access to the underlying ConnectorRegistry.
    pub fn registry(&self) -> &ConnectorRegistry {
        &self.registry
    }

    /// Provides access to the underlying BackupManager.
    pub fn backup_manager(&self) -> &BackupManager {
        &self.backup_manager
    }

    fn build_record(
        &self,
        connector_id: &str,
        provider_id: &str,
        outcome: SyncOutcome,
        changes_summary: &str,
        backup_path: Option<&str>,
    ) -> SyncRecord {
        SyncRecord {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            connector_id: connector_id.to_string(),
            provider_id: provider_id.to_string(),
            result: outcome,
            changes_summary: changes_summary.to_string(),
            backup_path: backup_path.map(|s| s.to_string()),
        }
    }

    fn build_failed_result(
        &self,
        connector_id: &str,
        provider_id: &str,
        code: &str,
        message: &str,
        backup_path: Option<&str>,
    ) -> SyncResult {
        let record = self.build_record(
            connector_id,
            provider_id,
            SyncOutcome::Failed,
            "0 change(s)",
            backup_path,
        );
        SyncResult {
            outcome: SyncOutcome::Failed,
            record,
            error: Some(ErrorInfo {
                code: code.to_string(),
                message: message.to_string(),
            }),
        }
    }
}
