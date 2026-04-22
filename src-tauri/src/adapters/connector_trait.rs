use crate::types::{
    ConnectorMeta, ConnectorResult, DetectResult, ProviderConfig, SyncPlan,
};

/// Connector Contract — all Connector implementations must implement this trait.
/// Each Connector represents an integration with a local AI tool (e.g., Codex CLI, Claude Code).
pub trait Connector: Send + Sync {
    /// Returns the connector's metadata (id, display name, config paths, version).
    fn meta(&self) -> &ConnectorMeta;

    /// Detects whether the target AI tool is installed on the local system.
    fn detect(&self) -> ConnectorResult<DetectResult>;

    /// Reads the current configuration of the target AI tool.
    fn read_config(&self) -> ConnectorResult<serde_json::Value>;

    /// Generates a sync plan describing what changes would be applied.
    fn plan_sync(&self, provider_config: &ProviderConfig) -> ConnectorResult<SyncPlan>;

    /// Applies the sync plan, writing configuration changes to the target tool.
    fn apply_sync(&self, plan: &SyncPlan) -> ConnectorResult<()>;

    /// Creates a backup of the current configuration before sync. Returns the backup path.
    fn backup(&self) -> ConnectorResult<String>;

    /// Rolls back to a previous backup.
    fn rollback(&self, backup_path: &str) -> ConnectorResult<()>;
}
