use tauri::State;

use crate::services::{ProviderRegistry, SyncEngine};
use crate::types::{CommandResponse, ConnectorResult, SyncPlan, SyncRecord, SyncResult};

/// Generate a sync plan without executing it.
#[tauri::command]
pub fn sync_plan(
    connector_id: String,
    provider_id: String,
    sync_engine: State<'_, SyncEngine>,
    provider_registry: State<'_, ProviderRegistry>,
) -> CommandResponse<SyncPlan> {
    let provider_config = match provider_registry.get_config(&provider_id) {
        Some(c) => c,
        None => {
            return CommandResponse::err(
                "PROVIDER_CONFIG_NOT_FOUND",
                format!("No saved config for provider '{}'", provider_id),
            );
        }
    };

    match sync_engine.get_plan(&connector_id, &provider_config) {
        Ok(plan) => CommandResponse::ok(plan),
        Err(error) => CommandResponse::err(error.code, error.message),
    }
}

/// Execute a sync operation (includes automatic backup and rollback on failure).
#[tauri::command]
pub fn sync_apply(
    plan: SyncPlan,
    sync_engine: State<'_, SyncEngine>,
    provider_registry: State<'_, ProviderRegistry>,
) -> CommandResponse<SyncResult> {
    let provider_config = match provider_registry.get_config(&plan.provider_id) {
        Some(c) => c,
        None => {
            return CommandResponse::err(
                "PROVIDER_CONFIG_NOT_FOUND",
                format!("No saved config for provider '{}'", plan.provider_id),
            );
        }
    };

    let result = sync_engine.execute_sync(&plan.connector_id, &provider_config);
    CommandResponse::ok(result)
}

/// Rollback a connector's configuration to a previous backup.
#[tauri::command]
pub fn sync_rollback(
    connector_id: String,
    backup_path: String,
    sync_engine: State<'_, SyncEngine>,
) -> CommandResponse<()> {
    let connector = match sync_engine.registry().get(&connector_id) {
        Some(c) => c,
        None => {
            return CommandResponse::err(
                "CONNECTOR_NOT_FOUND",
                format!("Connector '{}' not found", connector_id),
            );
        }
    };

    match connector.rollback(&backup_path) {
        ConnectorResult::Ok { .. } => CommandResponse::ok(()),
        ConnectorResult::Err { error, .. } => CommandResponse::err(error.code, error.message),
    }
}

/// Query sync history records.
#[tauri::command]
pub fn sync_history(
    limit: Option<usize>,
    sync_engine: State<'_, SyncEngine>,
) -> CommandResponse<Vec<SyncRecord>> {
    CommandResponse::ok(sync_engine.get_history(limit))
}
