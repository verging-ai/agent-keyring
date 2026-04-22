/** Connector 元数据 */
export interface ConnectorMeta {
  id: string;
  displayName: string;
  configPathPatterns: string[];
  version: string;
}

/** 检测结果 */
export interface DetectResult {
  installed: boolean;
  version?: string;
  configPaths: string[];
}

/** 同步计划中的单个变更项 */
export interface SyncChange {
  path: string;
  field: string;
  oldValue: string | null;
  newValue: string;
  changeType: "add" | "update" | "remove";
}

/** 同步计划 */
export interface SyncPlan {
  connectorId: string;
  providerId: string;
  changes: SyncChange[];
  timestamp: string;
}

/** 操作结果（泛型） */
export type ConnectorResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };
