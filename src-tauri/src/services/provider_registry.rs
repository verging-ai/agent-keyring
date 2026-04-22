use std::sync::Mutex;

use crate::adapters::providers::{AnthropicProvider, OpenAiProvider};
use crate::adapters::ProviderAdapter;
use crate::types::{ProviderConfig, ProviderMeta};

/// Provider 注册表 — 存储所有可用 Provider Adapter 实例和用户保存的配置。
pub struct ProviderRegistry {
    adapters: Vec<Box<dyn ProviderAdapter>>,
    configs: Mutex<Vec<ProviderConfig>>,
}

impl ProviderRegistry {
    /// 创建注册表并静态注册所有内置 Provider。
    pub fn new() -> Self {
        let mut registry = Self {
            adapters: Vec::new(),
            configs: Mutex::new(Vec::new()),
        };
        registry.register_adapter(Box::new(OpenAiProvider::new()));
        registry.register_adapter(Box::new(AnthropicProvider::new()));
        registry
    }

    pub fn register_adapter(&mut self, adapter: Box<dyn ProviderAdapter>) {
        self.adapters.push(adapter);
    }

    pub fn get_adapter(&self, provider_id: &str) -> Option<&dyn ProviderAdapter> {
        self.adapters
            .iter()
            .find(|a| a.meta().id == provider_id)
            .map(|a| a.as_ref())
    }

    pub fn list_metas(&self) -> Vec<&ProviderMeta> {
        self.adapters.iter().map(|a| a.meta()).collect()
    }

    /// Save or update a provider config. Replaces existing config with same provider_id.
    pub fn save_config(&self, config: ProviderConfig) {
        let mut configs = self.configs.lock().unwrap();
        if let Some(existing) = configs.iter_mut().find(|c| c.provider_id == config.provider_id) {
            *existing = config;
        } else {
            configs.push(config);
        }
    }

    pub fn list_configs(&self) -> Vec<ProviderConfig> {
        self.configs.lock().unwrap().clone()
    }

    pub fn delete_config(&self, provider_id: &str) -> bool {
        let mut configs = self.configs.lock().unwrap();
        let len_before = configs.len();
        configs.retain(|c| c.provider_id != provider_id);
        configs.len() < len_before
    }

    /// Get a saved config by provider_id.
    pub fn get_config(&self, provider_id: &str) -> Option<ProviderConfig> {
        self.configs
            .lock()
            .unwrap()
            .iter()
            .find(|c| c.provider_id == provider_id)
            .cloned()
    }
}
