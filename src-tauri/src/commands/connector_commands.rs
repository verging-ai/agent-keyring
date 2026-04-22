use tauri::State;

use crate::services::{DiscoveryResult, DiscoveryService, SyncEngine};
use crate::types::{CommandResponse, ConnectorMeta, ConnectorResult, DetectResult};

/// List all registered connectors.
#[tauri::command]
pub fn connector_list(
    sync_engine: State<'_, SyncEngine>,
) -> CommandResponse<Vec<ConnectorMeta>> {
    let metas: Vec<ConnectorMeta> = sync_engine
        .registry()
        .list_all()
        .into_iter()
        .cloned()
        .collect();
    CommandResponse::ok(metas)
}

/// Detect whether a specific connector's target tool is installed.
#[tauri::command]
pub fn connector_detect(
    connector_id: String,
    sync_engine: State<'_, SyncEngine>,
) -> CommandResponse<DetectResult> {
    let connector = match sync_engine.registry().get(&connector_id) {
        Some(c) => c,
        None => {
            return CommandResponse::err(
                "CONNECTOR_NOT_FOUND",
                format!("Connector '{}' not found", connector_id),
            );
        }
    };

    match connector.detect() {
        ConnectorResult::Ok { data, .. } => CommandResponse::ok(data),
        ConnectorResult::Err { error, .. } => CommandResponse::err(error.code, error.message),
    }
}

/// Scan all registered connectors to discover installed AI tools.
#[tauri::command]
pub fn discovery_scan(
    sync_engine: State<'_, SyncEngine>,
) -> CommandResponse<Vec<DiscoveryResult>> {
    let discovery = DiscoveryService::new(sync_engine.registry());
    CommandResponse::ok(discovery.scan_all())
}
