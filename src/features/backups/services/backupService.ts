import { commands } from "../../../shared/utils/tauriCommand";
import type { BackupRecord } from "../../../shared/types";

/** Backup 领域服务 — 封装备份相关的 Tauri Command 调用 */
export const backupService = {
  /** 获取备份记录列表，可按 connectorId 过滤 */
  list: (connectorId?: string): Promise<BackupRecord[]> =>
    commands.backupList(connectorId),
};
