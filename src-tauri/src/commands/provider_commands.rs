use tauri::State;

use crate::services::ProviderRegistry;
use crate::types::{
    CommandResponse, ConnectorResult, KeyValidationResult, ModelInfo, ProviderConfig,
};

/// Validate an API key for a given provider.
#[tauri::command]
pub fn provider_validate_key(
    provider_id: String,
    api_key: String,
    provider_registry: State<'_, ProviderRegistry>,
) -> CommandResponse<KeyValidationResult> {
    let adapter = match provider_registry.get_adapter(&provider_id) {
        Some(a) => a,
        None => {
            return CommandResponse::err(
                "PROVIDER_NOT_FOUND",
                format!("Provider '{}' not found", provider_id),
            );
        }
    };

    match adapter.validate_key(&api_key) {
        ConnectorResult::Ok { data, .. } => CommandResponse::ok(data),
        ConnectorResult::Err { error, .. } => CommandResponse::err(error.code, error.message),
    }
}

/// List available models for a given provider.
#[tauri::command]
pub fn provider_list_models(
    provider_id: String,
    provider_registry: State<'_, ProviderRegistry>,
) -> CommandResponse<Vec<ModelInfo>> {
    let adapter = match provider_registry.get_adapter(&provider_id) {
        Some(a) => a,
        None => {
            return CommandResponse::err(
                "PROVIDER_NOT_FOUND",
                format!("Provider '{}' not found", provider_id),
            );
        }
    };

    // Get the saved config to retrieve the API key
    let config = match provider_registry.get_config(&provider_id) {
        Some(c) => c,
        None => {
            return CommandResponse::err(
                "PROVIDER_CONFIG_NOT_FOUND",
                format!("No saved config for provider '{}'", provider_id),
            );
        }
    };

    match adapter.list_models(&config.api_key) {
        ConnectorResult::Ok { data, .. } => CommandResponse::ok(data),
        ConnectorResult::Err { error, .. } => CommandResponse::err(error.code, error.message),
    }
}

/// Save a provider configuration.
#[tauri::command]
pub fn provider_save(
    config: ProviderConfig,
    provider_registry: State<'_, ProviderRegistry>,
) -> CommandResponse<()> {
    provider_registry.save_config(config);
    CommandResponse::ok(())
}

/// List all saved provider configurations.
#[tauri::command]
pub fn provider_list(
    provider_registry: State<'_, ProviderRegistry>,
) -> CommandResponse<Vec<ProviderConfig>> {
    CommandResponse::ok(provider_registry.list_configs())
}

/// Delete a saved provider configuration.
#[tauri::command]
pub fn provider_delete(
    provider_id: String,
    provider_registry: State<'_, ProviderRegistry>,
) -> CommandResponse<()> {
    if provider_registry.delete_config(&provider_id) {
        CommandResponse::ok(())
    } else {
        CommandResponse::err(
            "PROVIDER_CONFIG_NOT_FOUND",
            format!("No saved config for provider '{}'", provider_id),
        )
    }
}
