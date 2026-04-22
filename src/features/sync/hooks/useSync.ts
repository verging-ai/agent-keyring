import { useState, useCallback, useRef } from "react";
import type { SyncPlan, SyncResult, SyncRecord } from "../../../shared/types";
import { syncService } from "../services/syncService";

type SyncStep = "idle" | "planning" | "previewing" | "syncing" | "done" | "error";

interface UseSyncState {
  step: SyncStep;
  plan: SyncPlan | null;
  result: SyncResult | null;
  history: SyncRecord[];
  error: string | null;
}

/** 同步流程状态管理 hook（含进度状态和并发锁定） */
export function useSync() {
  const [state, setState] = useState<UseSyncState>({
    step: "idle",
    plan: null,
    result: null,
    history: [],
    error: null,
  });

  // 跟踪正在同步的 connector，防止并发
  const syncingConnectors = useRef<Set<string>>(new Set());

  /** 生成同步计划并进入预览状态 */
  const preparePlan = useCallback(
    async (connectorId: string, providerId: string) => {
      if (syncingConnectors.current.has(connectorId)) {
        setState((s) => ({
          ...s,
          error: `Connector ${connectorId} 正在同步中，请等待完成`,
        }));
        return;
      }

      setState((s) => ({ ...s, step: "planning", error: null }));
      try {
        const plan = await syncService.plan(connectorId, providerId);
        setState((s) => ({ ...s, step: "previewing", plan }));
      } catch (err) {
        setState((s) => ({
          ...s,
          step: "error",
          error: err instanceof Error ? err.message : "生成同步计划失败",
        }));
      }
    },
    [],
  );

  /** 确认并执行同步 */
  const confirmSync = useCallback(async () => {
    const plan = state.plan;
    if (!plan) return;

    const connectorId = plan.connectorId;
    if (syncingConnectors.current.has(connectorId)) {
      setState((s) => ({
        ...s,
        error: `Connector ${connectorId} 正在同步中，请等待完成`,
      }));
      return;
    }

    syncingConnectors.current.add(connectorId);
    setState((s) => ({ ...s, step: "syncing", error: null }));

    try {
      const result = await syncService.apply(plan);
      setState((s) => ({ ...s, step: "done", result }));
    } catch (err) {
      setState((s) => ({
        ...s,
        step: "error",
        error: err instanceof Error ? err.message : "同步执行失败",
      }));
    } finally {
      syncingConnectors.current.delete(connectorId);
    }
  }, [state.plan]);

  /** 回滚到指定备份 */
  const rollback = useCallback(
    async (connectorId: string, backupPath: string) => {
      await syncService.rollback(connectorId, backupPath);
    },
    [],
  );

  /** 获取同步历史 */
  const fetchHistory = useCallback(async (limit?: number) => {
    try {
      const history = await syncService.history(limit);
      setState((s) => ({ ...s, history }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "获取同步历史失败",
      }));
    }
  }, []);

  /** 重置状态回到 idle */
  const reset = useCallback(() => {
    setState({
      step: "idle",
      plan: null,
      result: null,
      history: [],
      error: null,
    });
  }, []);

  return {
    ...state,
    preparePlan,
    confirmSync,
    rollback,
    fetchHistory,
    reset,
  };
}
