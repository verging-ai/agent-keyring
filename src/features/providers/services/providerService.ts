import { commands } from "../../../shared/utils/tauriCommand";
import type {
  ProviderConfig,
  KeyValidationResult,
  ModelInfo,
} from "../../../shared/types";

/** Provider 领域服务 — 封装所有 Provider 相关的 Tauri Command 调用 */
export const providerService = {
  /** 获取所有已保存的 Provider 配置 */
  list: () => commands.providerList(),

  /** 保存 Provider 配置 */
  save: (config: ProviderConfig) => commands.providerSave(config),

  /** 删除指定 Provider */
  delete: (providerId: string) => commands.providerDelete(providerId),

  /** 验证 API key 有效性 */
  validateKey: (providerId: string, apiKey: string): Promise<KeyValidationResult> =>
    commands.providerValidateKey(providerId, apiKey),

  /** 获取 Provider 可用模型列表 */
  listModels: (providerId: string): Promise<ModelInfo[]> =>
    commands.providerListModels(providerId),
};
