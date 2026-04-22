import { useState, useCallback } from "react";
import type {
  ProviderConfig,
  KeyValidationResult,
  ModelInfo,
} from "../../../shared/types";
import { providerService } from "../services/providerService";

interface UseProvidersState {
  providers: ProviderConfig[];
  loading: boolean;
  error: string | null;
}

/** Provider 数据获取和状态管理 hook */
export function useProviders() {
  const [state, setState] = useState<UseProvidersState>({
    providers: [],
    loading: false,
    error: null,
  });

  const fetchProviders = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const providers = await providerService.list();
      setState({ providers, loading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "获取 Provider 列表失败",
      }));
    }
  }, []);

  const saveProvider = useCallback(async (config: ProviderConfig) => {
    await providerService.save(config);
    await fetchProviders();
  }, [fetchProviders]);

  const deleteProvider = useCallback(async (providerId: string) => {
    await providerService.delete(providerId);
    await fetchProviders();
  }, [fetchProviders]);

  const validateKey = useCallback(
    (providerId: string, apiKey: string): Promise<KeyValidationResult> =>
      providerService.validateKey(providerId, apiKey),
    [],
  );

  const listModels = useCallback(
    (providerId: string): Promise<ModelInfo[]> =>
      providerService.listModels(providerId),
    [],
  );

  return {
    ...state,
    fetchProviders,
    saveProvider,
    deleteProvider,
    validateKey,
    listModels,
  };
}
