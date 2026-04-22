/** Provider 元数据 */
export interface ProviderMeta {
  id: string;
  displayName: string;
  authMethods: ("api_key" | "oauth")[];
}

/** Provider 配置（存储的 key 信息） */
export interface ProviderConfig {
  providerId: string;
  apiKey: string;
  baseUrl?: string;
  selectedModels: string[];
}

/** Key 验证状态 */
export type KeyValidationStatus = "valid" | "invalid" | "expired" | "rate_limited";

/** Key 验证结果 */
export interface KeyValidationResult {
  status: KeyValidationStatus;
  error?: string;
}

/** 模型信息 */
export interface ModelInfo {
  id: string;
  displayName: string;
  capabilities: string[];
}

/** Provider 能力描述 */
export interface ProviderCapabilities {
  supportsStreaming: boolean;
  supportsToolUse: boolean;
  maxContextWindow: number;
}
