use serde::{Deserialize, Serialize};

use super::connector::ErrorInfo;

/// 统一响应类型 — 所有 Tauri Command 的返回值包装
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CommandResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<ErrorInfo>,
}

impl<T> CommandResponse<T> {
    /// 创建成功响应
    pub fn ok(data: T) -> Self {
        CommandResponse {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    /// 创建错误响应
    pub fn err(code: impl Into<String>, message: impl Into<String>) -> Self {
        CommandResponse {
            success: false,
            data: None,
            error: Some(ErrorInfo {
                code: code.into(),
                message: message.into(),
            }),
        }
    }
}
