import type { DetectResult } from "./connector";

/** 发现状态枚举 */
export type DiscoveryStatus = "Installed" | "NotInstalled" | "DetectFailed" | "DetectTimeout";

/** 发现结果 */
export interface DiscoveryResult {
  connectorId: string;
  displayName: string;
  status: DiscoveryStatus;
  detail: DetectResult | null;
}
