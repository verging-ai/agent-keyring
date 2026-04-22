import { commands } from "../../../shared/utils/tauriCommand";
import type { DiscoveryResult } from "../../../shared/types";

/** Discovery 领域服务 — 封装本地 AI 工具扫描的 Tauri Command 调用 */
export const discoveryService = {
  /** 扫描所有已注册 Connector 的安装状态 */
  scan: (): Promise<DiscoveryResult[]> => commands.discoveryScan(),
};
