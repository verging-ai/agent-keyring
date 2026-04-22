import { useState, useCallback } from "react";
import type { BackupRecord } from "../../../shared/types";
import { backupService } from "../services/backupService";

interface UseBackupsState {
  backups: BackupRecord[];
  loading: boolean;
  error: string | null;
}

/** 备份列表获取和状态管理 hook */
export function useBackups() {
  const [state, setState] = useState<UseBackupsState>({
    backups: [],
    loading: false,
    error: null,
  });

  const fetchBackups = useCallback(async (connectorId?: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const backups = await backupService.list(connectorId);
      setState({ backups, loading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "获取备份列表失败",
      }));
    }
  }, []);

  return { ...state, fetchBackups };
}
