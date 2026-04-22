import { useState, useCallback } from "react";
import type { DiscoveryResult } from "../../../shared/types";
import { discoveryService } from "../services/discoveryService";

interface UseDiscoveryState {
  results: DiscoveryResult[];
  scanning: boolean;
  error: string | null;
}

/** 发现扫描和状态管理 hook */
export function useDiscovery() {
  const [state, setState] = useState<UseDiscoveryState>({
    results: [],
    scanning: false,
    error: null,
  });

  const scan = useCallback(async () => {
    setState((s) => ({ ...s, scanning: true, error: null }));
    try {
      const results = await discoveryService.scan();
      setState({ results, scanning: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        scanning: false,
        error: err instanceof Error ? err.message : "扫描失败",
      }));
    }
  }, []);

  return { ...state, scan };
}
