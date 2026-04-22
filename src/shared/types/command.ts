/** 错误信息 */
export interface ErrorInfo {
  code: string;
  message: string;
}

/** 统一响应类型 */
export interface CommandResponse<T> {
  success: boolean;
  data: T | null;
  error: ErrorInfo | null;
}
