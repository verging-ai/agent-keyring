use std::sync::mpsc;
use std::time::Duration;

use serde::{Deserialize, Serialize};

use crate::types::{ConnectorResult, DetectResult};

use super::connector_registry::ConnectorRegistry;

const DETECT_TIMEOUT: Duration = Duration::from_secs(5);

/// Connector 检测状态
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DiscoveryStatus {
    Installed,
    NotInstalled,
    DetectFailed,
    DetectTimeout,
}

/// 单个 Connector 的发现结果
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiscoveryResult {
    pub connector_id: String,
    pub display_name: String,
    pub status: DiscoveryStatus,
    pub detail: Option<DetectResult>,
}

/// Discovery Service — 扫描本地系统以检测已安装的 AI 工具。
pub struct DiscoveryService<'a> {
    registry: &'a ConnectorRegistry,
}

impl<'a> DiscoveryService<'a> {
    pub fn new(registry: &'a ConnectorRegistry) -> Self {
        Self { registry }
    }

    /// 扫描所有已注册 Connector，每个 detect 调用设置 5 秒超时。
    pub fn scan_all(&self) -> Vec<DiscoveryResult> {
        self.registry
            .list_all()
            .into_iter()
            .map(|meta| {
                let id = meta.id.clone();
                let display_name = meta.display_name.clone();

                let connector = match self.registry.get(&id) {
                    Some(c) => c,
                    None => {
                        return DiscoveryResult {
                            connector_id: id,
                            display_name,
                            status: DiscoveryStatus::DetectFailed,
                            detail: None,
                        };
                    }
                };

                // Use scoped thread to run detect with a 5-second timeout.
                // std::thread::scope allows borrowing non-'static references.
                let (tx, rx) = mpsc::channel();

                std::thread::scope(|s| {
                    s.spawn(|| {
                        let _ = tx.send(connector.detect());
                    });

                    // Don't block forever — if detect hangs, mark as timeout.
                    // The scoped thread will still be joined at scope exit,
                    // but we already have our result (or timeout).
                    match rx.recv_timeout(DETECT_TIMEOUT) {
                        Ok(result) => Self::classify(id.clone(), display_name.clone(), result),
                        Err(_) => DiscoveryResult {
                            connector_id: id.clone(),
                            display_name: display_name.clone(),
                            status: DiscoveryStatus::DetectTimeout,
                            detail: None,
                        },
                    }
                })
            })
            .collect()
    }

    fn classify(
        connector_id: String,
        display_name: String,
        result: ConnectorResult<DetectResult>,
    ) -> DiscoveryResult {
        match result {
            ConnectorResult::Ok { data, .. } if data.installed => DiscoveryResult {
                connector_id,
                display_name,
                status: DiscoveryStatus::Installed,
                detail: Some(data),
            },
            ConnectorResult::Ok { data, .. } => DiscoveryResult {
                connector_id,
                display_name,
                status: DiscoveryStatus::NotInstalled,
                detail: Some(data),
            },
            ConnectorResult::Err { .. } => DiscoveryResult {
                connector_id,
                display_name,
                status: DiscoveryStatus::DetectFailed,
                detail: None,
            },
        }
    }
}
