#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod adapters;
mod commands;
mod services;
mod types;

use std::path::PathBuf;

use services::{BackupManager, ConnectorRegistry, ProviderRegistry, SyncEngine};
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Determine backup directory: {app_data_dir}/backups
            let backup_dir = app
                .path()
                .app_data_dir()
                .map(|p| p.join("backups"))
                .unwrap_or_else(|_| PathBuf::from("backups"));

            let connector_registry = ConnectorRegistry::new();
            let backup_manager = BackupManager::new(backup_dir);
            let sync_engine = SyncEngine::new(connector_registry, backup_manager);
            let provider_registry = ProviderRegistry::new();

            app.manage(sync_engine);
            app.manage(provider_registry);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Provider commands
            commands::provider_validate_key,
            commands::provider_list_models,
            commands::provider_save,
            commands::provider_list,
            commands::provider_delete,
            // Connector commands
            commands::connector_list,
            commands::connector_detect,
            commands::discovery_scan,
            // Sync commands
            commands::sync_plan,
            commands::sync_apply,
            commands::sync_rollback,
            commands::sync_history,
            // Backup commands
            commands::backup_list,
        ])
        .run(tauri::generate_context!())
        .expect("error while running AgentKeyring");
}
