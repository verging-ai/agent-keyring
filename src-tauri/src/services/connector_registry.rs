use crate::adapters::connectors::{ClaudeCodeConnector, CodexCliConnector};
use crate::adapters::Connector;
use crate::types::ConnectorMeta;

/// Connector 注册表 — 存储所有可用 Connector 的实例引用。
/// 新增 Connector 只需在 `new()` 中添加一行 `register` 调用。
pub struct ConnectorRegistry {
    connectors: Vec<Box<dyn Connector>>,
}

impl ConnectorRegistry {
    /// 创建注册表并静态注册所有内置 Connector。
    pub fn new() -> Self {
        let mut registry = Self {
            connectors: Vec::new(),
        };
        registry.register(Box::new(CodexCliConnector::new()));
        registry.register(Box::new(ClaudeCodeConnector::new()));
        registry
    }

    /// 注册一个新的 Connector 实例。
    pub fn register(&mut self, connector: Box<dyn Connector>) {
        self.connectors.push(connector);
    }

    /// 返回所有已注册 Connector 的元数据列表。
    pub fn list_all(&self) -> Vec<&ConnectorMeta> {
        self.connectors.iter().map(|c| c.meta()).collect()
    }

    /// 根据 id 查找 Connector 实例。
    pub fn get(&self, id: &str) -> Option<&dyn Connector> {
        self.connectors
            .iter()
            .find(|c| c.meta().id == id)
            .map(|c| c.as_ref())
    }
}
