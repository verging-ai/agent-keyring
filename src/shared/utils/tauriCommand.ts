import { invoke } from "@tauri-apps/api/core";
import type {
  CommandResponse,
  KeyValidationResult,
  ModelInfo,
  ProviderConfig,
  ConnectorMeta,
  DetectResult,
  DiscoveryResult,
  SyncPlan,
  SyncResult,
  BackupRecord,
  SyncRecord,
} from "../types";

/** Tauri Command 调用错误 */
export class TauriCommandError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "TauriCommandError";
  }
}

/** 类型安全的 Tauri Command 调用封装 */
export async function tauriCommand<T>(
  cmd: string,
  args?: Record<string, unknown>,
): Promise<T> {
  const response = await invoke<CommandResponse<T>>(cmd, args);
  if (!response.success || response.data === null) {
    throw new TauriCommandError(
      response.error?.code ?? "UNKNOWN",
      response.error?.message ?? "未知错误",
    );
  }
  return response.data;
}

/** 所有 Tauri Command 的类型包装函数 */
export const commands = {
  providerValidateKey: (providerId: string, apiKey: string) =>
    tauriCommand<KeyValidationResult>("provider_validate_key", {
      provider_id: providerId,
      api_key: apiKey,
    }),

  providerListModels: (providerId: string) =>
    tauriCommand<ModelInfo[]>("provider_list_models", {
      provider_id: providerId,
    }),

  providerSave: (config: ProviderConfig) =>
    tauriCommand<void>("provider_save", { config }),

  providerList: () => tauriCommand<ProviderConfig[]>("provider_list", {}),

  providerDelete: (providerId: string) =>
    tauriCommand<void>("provider_delete", { provider_id: providerId }),

  connectorList: () => tauriCommand<ConnectorMeta[]>("connector_list", {}),

  connectorDetect: (connectorId: string) =>
    tauriCommand<DetectResult>("connector_detect", {
      connector_id: connectorId,
    }),

  discoveryScan: () =>
    tauriCommand<DiscoveryResult[]>("discovery_scan", {}),

  syncPlan: (connectorId: string, providerId: string) =>
    tauriCommand<SyncPlan>("sync_plan", {
      connector_id: connectorId,
      provider_id: providerId,
    }),

  syncApply: (plan: SyncPlan) =>
    tauriCommand<SyncResult>("sync_apply", { plan }),

  syncRollback: (connectorId: string, backupPath: string) =>
    tauriCommand<void>("sync_rollback", {
      connector_id: connectorId,
      backup_path: backupPath,
    }),

  backupList: (connectorId?: string) =>
    tauriCommand<BackupRecord[]>("backup_list", {
      connector_id: connectorId,
    }),

  syncHistory: (limit?: number) =>
    tauriCommand<SyncRecord[]>("sync_history", { limit }),
};
