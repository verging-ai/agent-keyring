use std::fs;
use std::path::{Path, PathBuf};

use crate::types::BackupRecord;

/// 备份管理器 — 负责在配置写入前创建备份并支持回滚。
/// 备份路径格式：`{backup_dir}/{connector_id}/{timestamp}.bak`
pub struct BackupManager {
    backup_dir: PathBuf,
}

impl BackupManager {
    /// 创建 BackupManager，使用指定的备份目录。
    pub fn new(backup_dir: PathBuf) -> Self {
        Self { backup_dir }
    }

    /// 生成备份路径: `{backup_dir}/{connector_id}/{timestamp}.bak`
    pub fn generate_backup_path(&self, connector_id: &str) -> PathBuf {
        let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S%.3f");
        self.backup_dir
            .join(connector_id)
            .join(format!("{}.bak", timestamp))
    }

    /// 创建备份：将 source_path 的内容复制到备份路径。
    /// 返回备份文件的路径字符串。
    pub fn create_backup(
        &self,
        connector_id: &str,
        source_path: &Path,
    ) -> Result<String, String> {
        let backup_path = self.generate_backup_path(connector_id);

        // Ensure the parent directory exists
        if let Some(parent) = backup_path.parent() {
            fs::create_dir_all(parent).map_err(|e| {
                format!(
                    "Failed to create backup directory '{}': {}",
                    parent.display(),
                    e
                )
            })?;
        }

        fs::copy(source_path, &backup_path).map_err(|e| {
            format!(
                "Failed to copy '{}' to '{}': {}",
                source_path.display(),
                backup_path.display(),
                e
            )
        })?;

        Ok(backup_path.to_string_lossy().into_owned())
    }

    /// 从备份恢复：将备份文件内容复制回目标路径。
    pub fn restore_backup(
        &self,
        backup_path: &str,
        target_path: &Path,
    ) -> Result<(), String> {
        let backup = Path::new(backup_path);
        if !backup.exists() {
            return Err(format!("Backup file not found: {}", backup_path));
        }

        fs::copy(backup, target_path).map_err(|e| {
            format!(
                "Failed to restore backup '{}' to '{}': {}",
                backup_path,
                target_path.display(),
                e
            )
        })?;

        Ok(())
    }

    /// 列出指定 connector（或全部）的备份记录。
    pub fn list_backups(&self, connector_id: Option<&str>) -> Result<Vec<BackupRecord>, String> {
        let mut records = Vec::new();

        let search_dir = match connector_id {
            Some(id) => {
                let dir = self.backup_dir.join(id);
                if !dir.exists() {
                    return Ok(records);
                }
                vec![(id.to_string(), dir)]
            }
            None => {
                if !self.backup_dir.exists() {
                    return Ok(records);
                }
                let entries = fs::read_dir(&self.backup_dir).map_err(|e| {
                    format!(
                        "Failed to read backup directory '{}': {}",
                        self.backup_dir.display(),
                        e
                    )
                })?;
                entries
                    .filter_map(|entry| {
                        let entry = entry.ok()?;
                        let path = entry.path();
                        if path.is_dir() {
                            let name = entry.file_name().to_string_lossy().into_owned();
                            Some((name, path))
                        } else {
                            None
                        }
                    })
                    .collect()
            }
        };

        for (cid, dir) in search_dir {
            let entries = fs::read_dir(&dir).map_err(|e| {
                format!("Failed to read directory '{}': {}", dir.display(), e)
            })?;

            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().and_then(|e| e.to_str()) == Some("bak") {
                    let metadata = fs::metadata(&path).ok();
                    let size_bytes = metadata.map(|m| m.len()).unwrap_or(0);
                    let filename = path
                        .file_stem()
                        .and_then(|s| s.to_str())
                        .unwrap_or("")
                        .to_string();

                    records.push(BackupRecord {
                        path: path.to_string_lossy().into_owned(),
                        connector_id: cid.clone(),
                        timestamp: filename,
                        size_bytes,
                    });
                }
            }
        }

        // Sort by timestamp descending (newest first)
        records.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        Ok(records)
    }

    /// Returns a reference to the backup directory path.
    pub fn backup_dir(&self) -> &Path {
        &self.backup_dir
    }
}
