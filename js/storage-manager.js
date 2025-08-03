// 高性能ローカルストレージ管理クラス
class StorageManager {
  constructor() {
    this.cache = new Map();
    this.saveQueue = new Map();
    this.saveTimer = null;
    this.compressionEnabled = true;
    this.maxCacheSize = 50; // キャッシュ最大サイズ
  }

  // データの圧縮（簡易版）
  compress(data) {
    if (!this.compressionEnabled) return data;
    try {
      return btoa(JSON.stringify(data));
    } catch (error) {
      console.warn('Compression failed, using raw data:', error);
      return JSON.stringify(data);
    }
  }

  // データの展開
  decompress(data) {
    if (!this.compressionEnabled) return JSON.parse(data);
    try {
      return JSON.parse(atob(data));
    } catch (error) {
      // 圧縮されていない場合はそのままJSONパース
      try {
        return JSON.parse(data);
      } catch (parseError) {
        console.error('Decompression failed:', parseError);
        return null;
      }
    }
  }

  // キャッシュから取得
  get(key) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    try {
      const data = localStorage.getItem(key);
      if (data === null) return null;
      
      const parsed = this.decompress(data);
      
      // キャッシュサイズ制限
      if (this.cache.size >= this.maxCacheSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      
      this.cache.set(key, parsed);
      return parsed;
    } catch (error) {
      console.error('Failed to get from storage:', key, error);
      return null;
    }
  }

  // バッチ保存（デバウンス）
  set(key, value, immediate = false) {
    // キャッシュ更新
    this.cache.set(key, value);
    
    if (immediate) {
      this.saveImmediately(key, value);
    } else {
      // 保存キューに追加
      this.saveQueue.set(key, value);
      this.scheduleSave();
    }
  }

  // 即座に保存
  saveImmediately(key, value) {
    try {
      const compressed = this.compress(value);
      localStorage.setItem(key, compressed);
      this.saveQueue.delete(key);
    } catch (error) {
      console.error('Failed to save to storage:', key, error);
      this.handleStorageError(error);
    }
  }

  // バッチ保存のスケジューリング
  scheduleSave() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    
    this.saveTimer = setTimeout(() => {
      this.flushSaveQueue();
    }, 500); // 500ms後にバッチ保存
  }

  // 保存キューの処理
  flushSaveQueue() {
    if (this.saveQueue.size === 0) return;
    
    const batch = Array.from(this.saveQueue.entries());
    this.saveQueue.clear();
    
    // バッチ処理
    requestIdleCallback(() => {
      batch.forEach(([key, value]) => {
        try {
          const compressed = this.compress(value);
          localStorage.setItem(key, compressed);
        } catch (error) {
          console.error('Batch save failed for key:', key, error);
        }
      });
    }, { timeout: 1000 });
  }

  // ストレージエラーハンドリング
  handleStorageError(error) {
    if (error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, attempting cleanup...');
      this.cleanup();
    }
  }

  // 古いデータのクリーンアップ
  cleanup() {
    const keys = Object.keys(localStorage);
    const dataWithTimestamp = keys
      .filter(key => key.startsWith('sectionLinks_') || key.startsWith('tasks'))
      .map(key => {
        try {
          const data = this.get(key);
          const timestamp = data?.lastModified || 0;
          return { key, timestamp, size: localStorage.getItem(key)?.length || 0 };
        } catch {
          return { key, timestamp: 0, size: 0 };
        }
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    // 古いデータから削除（最大30%まで）
    const deleteCount = Math.floor(dataWithTimestamp.length * 0.3);
    for (let i = 0; i < deleteCount; i++) {
      const { key } = dataWithTimestamp[i];
      localStorage.removeItem(key);
      this.cache.delete(key);
    }
  }

  // ストレージ使用量の取得
  getStorageUsage() {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage.getItem(key).length;
      }
    }
    return {
      used: totalSize,
      quota: 5 * 1024 * 1024, // 5MB (概算)
      percentage: (totalSize / (5 * 1024 * 1024)) * 100
    };
  }

  // キャッシュクリア
  clearCache() {
    this.cache.clear();
  }

  // 強制保存
  forceSave() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    this.flushSaveQueue();
  }
}

// グローバルインスタンス
window.storageManager = new StorageManager();