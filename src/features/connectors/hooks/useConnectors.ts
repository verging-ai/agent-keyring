import { useState, useCallback } from "react";
import type { ConnectorMeta, DetectResult } from "../../../shared/types";
import { connectorService } from "../services/connectorService";

interface UseConnectorsState {
  connectors: ConnectorMeta[];
  detectResults: Record<string, DetectResult>;
  loading: boolean;
  error: string | null;
}

/** Connector 数据获取和状态管理 hook */
export function useConnectors() {
  const [state, setState] = useState<UseConnectorsState>({
    connectors: [],
    detectResults: {},
    loading: false,
    error: null,
  });

  const fetchConnectors = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const connectors = await connectorService.list();
      setState((s) => ({ ...s, connectors, loading: false, error: null }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "获取 Connector 列表失败",
      }));
    }
  }, []);

  const detectConnector = useCallback(async (connectorId: string) => {
    try {
      const result = await connectorService.detect(connectorId);
      setState((s) => ({
        ...s,
        detectResults: { ...s.detectResults, [connectorId]: result },
      }));
      return result;
    } catch (err) {
      throw err instanceof Error ? err : new Error("检测 Connector 失败");
    }
  }, []);

  return {
    ...state,
    fetchConnectors,
    detectConnector,
  };
}
