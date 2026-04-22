/** 备份记录 */
export interface BackupRecord {
  path: string;
  connectorId: string;
  timestamp: string;
  sizeBytes: number;
}
