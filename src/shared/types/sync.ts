/** 同步操作结果枚举 */
export type SyncOutcome = "Success" | "Failed" | "RolledBack";

/** 同步记录 */
export interface SyncRecord {
  id: string;
  timestamp: string;
  connectorId: string;
  providerId: string;
  result: SyncOutcome;
  changesSummary: string;
  backupPath: string | null;
}

/** 同步结果 */
export interface SyncResult {
  outcome: SyncOutcome;
  record: SyncRecord;
  error: { code: string; message: string } | null;
}
