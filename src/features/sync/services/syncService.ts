import { commands } from "../../../shared/utils/tauriCommand";
import type { SyncPlan, SyncResult, SyncRecord } from "../../../shared/types";

/** Sync 领域服务 — 封装同步流程相关的 Tauri Command 调用 */
export const syncService = {
  /** 生成同步计划（变更预览） */
  plan: (connectorId: string, providerId: string): Promise<SyncPlan> =>
    commands.syncPlan(connectorId, providerId),

  /** 执行同步（含自动备份和失败回滚） */
  apply: (plan: SyncPlan): Promise<SyncResult> => commands.syncApply(plan),

  /** 回滚到指定备份 */
  rollback: (connectorId: string, backupPath: string): Promise<void> =>
    commands.syncRollback(connectorId, backupPath),

  /** 查询同步历史记录 */
  history: (limit?: number): Promise<SyncRecord[]> =>
    commands.syncHistory(limit),
};
