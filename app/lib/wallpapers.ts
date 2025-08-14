// Lightweight IndexedDB helper for storing wallpaper blobs and resolving to short blob: URLs
// This avoids embedding huge data URLs in the DOM while keeping user uploads persisted locally.

export type WallpaperId = string; // crypto.randomUUID()

const DB_NAME = 'portfolio-wallpapers';
const DB_VERSION = 1;
const STORE_NAME = 'wallpapers';

type StoredWallpaper = {
  id: WallpaperId;
  blob: Blob;
  createdAt: number;
};

let openDbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (openDbPromise) return openDbPromise;
  openDbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return openDbPromise;
}

export async function saveWallpaperBlob(file: Blob): Promise<WallpaperId> {
  const db = await openDb();
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? (crypto as unknown as { randomUUID: () => string }).randomUUID()
    : String(Date.now()) + '-' + Math.random().toString(36).slice(2);
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const record: StoredWallpaper = { id, blob: file, createdAt: Date.now() };
  await new Promise<void>((resolve, reject) => {
    const putReq = store.put(record);
    putReq.onsuccess = () => resolve();
    putReq.onerror = () => reject(putReq.error);
  });
  return id;
}

export async function getWallpaperBlob(id: WallpaperId): Promise<Blob | null> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return await new Promise<Blob | null>((resolve, reject) => {
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const value = getReq.result as StoredWallpaper | undefined;
      resolve(value ? value.blob : null);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

// Cache blob: URLs per id to avoid recreating repeatedly
const idToBlobUrl = new Map<WallpaperId, string>();

export async function getWallpaperBlobUrl(id: WallpaperId): Promise<string | null> {
  if (idToBlobUrl.has(id)) return idToBlobUrl.get(id)!;
  const blob = await getWallpaperBlob(id);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  idToBlobUrl.set(id, url);
  return url;
}

export function revokeWallpaperUrl(id: WallpaperId) {
  const url = idToBlobUrl.get(id);
  if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
  idToBlobUrl.delete(id);
}

export function isIdbRef(value: string): boolean {
  return /^idb:[A-Za-z0-9\-]+/.test(value);
}

export function parseIdbRef(value: string): WallpaperId | null {
  if (!isIdbRef(value)) return null;
  return value.slice(4);
}

// Resolve a wallpaper "value" string to a browser-usable URL
// - If it is an IndexedDB ref (idb:<uuid>), return a blob: URL
// - Otherwise return the value unchanged
export async function resolveWallpaperUrl(value: string): Promise<string> {
  const id = parseIdbRef(value);
  if (!id) return value;
  const url = await getWallpaperBlobUrl(id);
  return url ?? value;
}


