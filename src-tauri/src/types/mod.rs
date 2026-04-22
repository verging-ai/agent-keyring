pub mod backup;
pub mod command;
pub mod connector;
pub mod provider;
pub mod sync;

// Re-export all types for convenient access
pub use backup::BackupRecord;
pub use command::CommandResponse;
pub use connector::{
    ConnectorMeta, ConnectorResult, DetectResult, ErrorInfo, SyncPlan,
};
pub use provider::{
    KeyValidationResult, KeyValidationStatus, ModelInfo, ProviderCapabilities, ProviderConfig,
    ProviderMeta,
};
pub use sync::{SyncOutcome, SyncRecord, SyncResult};
