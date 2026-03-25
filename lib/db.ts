'use client';

const DB_NAME = 'muze-db';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('clips')) {
        const store = db.createObjectStore('clips', { keyPath: 'id' });
        store.createIndex('projectId', 'projectId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

let _db: IDBDatabase | null = null;
async function db() {
  if (!_db) _db = await openDB();
  return _db;
}

export interface DBProject { id: string; name: string; createdAt: number; }
export interface DBClip {
  id: string; projectId: string;
  instrumentSlug: string; instrumentName: string; instrumentEmoji: string;
  blob: Blob; duration: number; createdAt: number; color: string;
}

export async function getAllProjects(): Promise<DBProject[]> {
  const d = await db();
  return req(d.transaction('projects', 'readonly').objectStore('projects').getAll());
}

export async function getClipsByProject(projectId: string): Promise<DBClip[]> {
  const d = await db();
  return req(d.transaction('clips', 'readonly').objectStore('clips').index('projectId').getAll(projectId));
}

export async function putProject(project: DBProject): Promise<void> {
  const d = await db();
  await req(d.transaction('projects', 'readwrite').objectStore('projects').put(project));
}

export async function deleteProject(id: string): Promise<void> {
  const d = await db();
  const t = d.transaction(['projects', 'clips'], 'readwrite');
  t.objectStore('projects').delete(id);
  return new Promise((resolve, reject) => {
    const r = t.objectStore('clips').index('projectId').getAll(id);
    r.onsuccess = () => {
      (r.result as DBClip[]).forEach((c) => t.objectStore('clips').delete(c.id));
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
    };
    r.onerror = () => reject(r.error);
  });
}

export async function putClip(clip: DBClip): Promise<void> {
  const d = await db();
  await req(d.transaction('clips', 'readwrite').objectStore('clips').put(clip));
}

export async function deleteClip(id: string): Promise<void> {
  const d = await db();
  await req(d.transaction('clips', 'readwrite').objectStore('clips').delete(id));
}

export async function clearProjectClips(projectId: string): Promise<void> {
  const d = await db();
  const t = d.transaction('clips', 'readwrite');
  return new Promise((resolve, reject) => {
    const r = t.objectStore('clips').index('projectId').getAll(projectId);
    r.onsuccess = () => {
      (r.result as DBClip[]).forEach((c) => t.objectStore('clips').delete(c.id));
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
    };
    r.onerror = () => reject(r.error);
  });
}
