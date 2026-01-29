/**
 * File Storage Service (IndexedDB)
 * 
 * ARCHITECTURE: Service (Layer 5) - Backend Service
 * - Stores File objects in browser IndexedDB
 * - Supports large files (50-100MB+)
 * - Async API
 * - NO user interaction
 * - Pure business logic
 * 
 * ELITE STANDARDS:
 * - <200 lines
 * - ServiceResult pattern
 * - No imports from modules/
 * - Single responsibility
 */

import { logger } from '@/lib/logger';

const DB_NAME = 'muniflow-bond-generator';
const DB_VERSION = 1;
const STORE_NAME = 'files';

interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  data: Blob;
  timestamp: number;
}

/**
 * Open IndexedDB connection
 * Creates database and object store if they don't exist
 */
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      logger.error('Failed to open IndexedDB', { error: request.error });
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        logger.info('Created IndexedDB object store', { storeName: STORE_NAME });
      }
    };
  });
}

/**
 * Save file to IndexedDB
 * Stores file with metadata for easy retrieval
 * 
 * @param id - Unique identifier (e.g., 'template', 'maturity', 'cusip')
 * @param file - File object to store
 */
export async function saveFileToIndexedDB(id: string, file: File): Promise<void> {
  try {
    const db = await openDB();
    
    const storedFile: StoredFile = {
      id,
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      data: file, // Store the entire blob
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(storedFile);

      request.onsuccess = () => {
        logger.info('File saved to IndexedDB', { 
          id, 
          name: file.name, 
          size: file.size 
        });
        resolve();
      };

      request.onerror = () => {
        logger.error('Failed to save file to IndexedDB', { 
          id, 
          error: request.error 
        });
        reject(new Error('Failed to save file'));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logger.error('IndexedDB save failed', { 
      id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw error;
  }
}

/**
 * Load file from IndexedDB
 * Reconstructs File object from stored blob and metadata
 * 
 * @param id - Unique identifier
 * @returns File object or null if not found
 */
export async function loadFileFromIndexedDB(id: string): Promise<File | null> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const storedFile = request.result as StoredFile | undefined;
        
        if (!storedFile) {
          logger.info('File not found in IndexedDB', { id });
          resolve(null);
          return;
        }

        // Reconstruct File object
        const file = new File([storedFile.data], storedFile.name, {
          type: storedFile.type,
          lastModified: storedFile.lastModified,
        });

        logger.info('File loaded from IndexedDB', { 
          id, 
          name: file.name, 
          size: file.size 
        });
        
        resolve(file);
      };

      request.onerror = () => {
        logger.error('Failed to load file from IndexedDB', { 
          id, 
          error: request.error 
        });
        reject(new Error('Failed to load file'));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logger.error('IndexedDB load failed', { 
      id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return null;
  }
}

/**
 * Delete file from IndexedDB
 * 
 * @param id - Unique identifier
 */
export async function deleteFileFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        logger.info('File deleted from IndexedDB', { id });
        resolve();
      };

      request.onerror = () => {
        logger.error('Failed to delete file from IndexedDB', { 
          id, 
          error: request.error 
        });
        reject(new Error('Failed to delete file'));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logger.error('IndexedDB delete failed', { 
      id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw error;
  }
}

/**
 * Clear all files from IndexedDB
 * Useful for cleanup or reset
 */
export async function clearAllFiles(): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        logger.info('All files cleared from IndexedDB');
        resolve();
      };

      request.onerror = () => {
        logger.error('Failed to clear IndexedDB', { error: request.error });
        reject(new Error('Failed to clear files'));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    logger.error('IndexedDB clear failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw error;
  }
}
