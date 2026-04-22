use crate::adapters::Connector;
use crate::types::{
    ConnectorMeta, ConnectorResult, DetectResult, ProviderConfig, SyncPlan,
};

pub struct ClaudeCodeConnector {
    meta: ConnectorMeta,
}

impl ClaudeCodeConnector {
    pub fn new() -> Self {
        Self {
            meta: ConnectorMeta {
                id: "claude-code".to_string(),
                display_name: "Claude Code".to_string(),
                config_path_patterns: vec!["~/.claude/config.json".to_string()],
                version: "0.1.0".to_string(),
            },
        }
    }
}

impl Connector for ClaudeCodeConnector {
    fn meta(&self) -> &ConnectorMeta {
        &self.meta
    }

    fn detect(&self) -> ConnectorResult<DetectResult> {
        // Stub: report as not installed
        ConnectorResult::ok(DetectResult {
            installed: false,
            version: None,
            config_paths: vec![],
        })
    }

    fn read_config(&self) -> ConnectorResult<serde_json::Value> {
        ConnectorResult::ok(serde_json::json!({}))
    }

    fn plan_sync(&self, _provider_config: &ProviderConfig) -> ConnectorResult<SyncPlan> {
        ConnectorResult::ok(SyncPlan {
            connector_id: self.meta.id.clone(),
            provider_id: String::new(),
            changes: vec![],
            timestamp: String::new(),
        })
    }

    fn apply_sync(&self, _plan: &SyncPlan) -> ConnectorResult<()> {
        ConnectorResult::ok(())
    }

    fn backup(&self) -> ConnectorResult<String> {
        ConnectorResult::err("CONNECTOR_NOT_IMPLEMENTED", "Backup not yet implemented for Claude Code")
    }

    fn rollback(&self, _backup_path: &str) -> ConnectorResult<()> {
        ConnectorResult::err("CONNECTOR_NOT_IMPLEMENTED", "Rollback not yet implemented for Claude Code")
    }
}
