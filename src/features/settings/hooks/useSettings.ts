import { useState, useCallback } from "react";

interface AppSettings {
  backupDirectory: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  backupDirectory: "",
};

interface UseSettingsState {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
}

/**
 * Settings state management hook.
 * Currently manages local state; will connect to Tauri backend
 * when settings commands are implemented.
 */
export function useSettings() {
  const [state, setState] = useState<UseSettingsState>({
    settings: DEFAULT_SETTINGS,
    loading: false,
    error: null,
  });

  const updateBackupDirectory = useCallback((dir: string) => {
    setState((s) => ({
      ...s,
      settings: { ...s.settings, backupDirectory: dir },
    }));
  }, []);

  return {
    ...state,
    updateBackupDirectory,
  };
}
