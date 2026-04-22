import { commands } from "../../../shared/utils/tauriCommand";
import type { ConnectorMeta, DetectResult } from "../../../shared/types";

/** Connector 领域服务 — 封装所有 Connector 相关的 Tauri Command 调用 */
export const connectorService = {
  /** 获取所有已注册的 Connector 元数据 */
  list: (): Promise<ConnectorMeta[]> => commands.connectorList(),

  /** 检测指定 Connector 的安装状态 */
  detect: (connectorId: string): Promise<DetectResult> =>
    commands.connectorDetect(connectorId),
};
