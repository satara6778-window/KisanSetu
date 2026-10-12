export interface OfflineDraft {
  localId: string;
  cropName: string;
  marathiAlias?: string;
  hindiAlias?: string;
  category: string;
  description: string;
  imageUrl?: string;
  availableQuantity: number;
  unit: string;
  pricePerUnit: number;
  qualityGrade?: string;
  village?: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  status: 'offline_draft' | 'pending_sync';
  createdAt: string;
}

const DB_NAME = 'KisanSetuOfflineDB';
const STORE_NAME = 'listing_drafts';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'localId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const offlineStorage = {
  async saveDraft(draft: Omit<OfflineDraft, 'localId' | 'status' | 'createdAt'>): Promise<OfflineDraft> {
    const fullDraft: OfflineDraft = {
      ...draft,
      localId: 'draft-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      status: 'pending_sync',
      createdAt: new Date().toISOString()
    };

    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(fullDraft);
        req.onsuccess = () => resolve(fullDraft);
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback to localStorage
      const existing = this.getLocalStorageDrafts();
      existing.push(fullDraft);
      localStorage.setItem('kisansetu_drafts', JSON.stringify(existing));
      return fullDraft;
    }
  },

  async getAllDrafts(): Promise<OfflineDraft[]> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.getLocalStorageDrafts();
    }
  },

  async deleteDraft(localId: string): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(localId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const filtered = this.getLocalStorageDrafts().filter(d => d.localId !== localId);
      localStorage.setItem('kisansetu_drafts', JSON.stringify(filtered));
    }
  },

  getLocalStorageDrafts(): OfflineDraft[] {
    try {
      const saved = localStorage.getItem('kisansetu_drafts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
};
