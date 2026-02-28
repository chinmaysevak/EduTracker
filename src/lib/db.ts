import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface EduTrackDB extends DBSchema {
  files: {
    key: string;
    value: {
      id: string;
      name: string;
      type: string;
      data: Blob;
      createdAt: Date;
    };
    indexes: { 'by-date': Date };
  };
}

const DB_NAME = 'edutrack-db';
const DB_VERSION = 1;

export async function initDB() {
  try {
    return await openDB<EduTrackDB>(DB_NAME, DB_VERSION, {
      upgrade(db: IDBPDatabase<EduTrackDB>) {
        if (!db.objectStoreNames.contains('files')) {
          const store = db.createObjectStore('files', { keyPath: 'id' });
          store.createIndex('by-date', 'createdAt');
        }
      },
    });
  } catch (error) {
    console.error("Failed to initialize IndexedDB:", error);
    throw error;
  }
}

export async function saveFile(file: File): Promise<string> {
  const db = await initDB();
  const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const record = {
    id,
    name: file.name,
    type: file.type,
    data: file,
    createdAt: new Date(),
  };
  await db.put('files', record);
  return id;
}

export async function getFile(id: string) {
  const db = await initDB();
  return db.get('files', id);
}

export async function getAllFiles() {
  const db = await initDB();
  return db.getAllFromIndex('files', 'by-date');
}

export async function deleteFile(id: string) {
  const db = await initDB();
  await db.delete('files', id);
}

export async function clearAllFiles() {
  const db = await initDB();
  await db.clear('files');
}
