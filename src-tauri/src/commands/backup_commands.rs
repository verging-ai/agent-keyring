use tauri::State;

use crate::services::SyncEngine;
use crate::types::{BackupRecord, CommandResponse};

/// List backup records, optionally filtered by connector_id.
#[tauri::command]
pub fn backup_list(
    connector_id: Option<String>,
    sync_engine: State<'_, SyncEngine>,
) -> CommandResponse<Vec<BackupRecord>> {
    match sync_engine
        .backup_manager()
        .list_backups(connector_id.as_deref())
    {
        Ok(records) => CommandResponse::ok(records),
        Err(msg) => CommandResponse::err("BACKUP_LIST_ERROR", msg),
    }
}
