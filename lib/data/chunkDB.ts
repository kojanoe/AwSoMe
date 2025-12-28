import { Chunk } from '@/lib/chat/chunking/chunkData';

const DB_NAME = 'InstagramRAG';
const DB_VERSION = 1;
const CHUNKS_STORE = 'chunks';
const EMBEDDINGS_STORE = 'embeddings';

export interface StoredChunk extends Chunk {
  embedding?: number[]; // Vector embedding
  createdAt: number; // Timestamp
}

// IndexedDB wrapper for RAG storage
export class ChunkDB {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  // Initialize IndexedDB (https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Chunks store
        if (!db.objectStoreNames.contains(CHUNKS_STORE)) {
          const chunksStore = db.createObjectStore(CHUNKS_STORE, { keyPath: 'id' });
          chunksStore.createIndex('sessionId', 'metadata.sessionId', { unique: false });
          chunksStore.createIndex('category', 'category', { unique: false });
          chunksStore.createIndex('priority', 'metadata.priority', { unique: false });
        }

        // Embeddings store (separate for optimization)
        if (!db.objectStoreNames.contains(EMBEDDINGS_STORE)) {
          const embeddingsStore = db.createObjectStore(EMBEDDINGS_STORE, { keyPath: 'chunkId' });
          embeddingsStore.createIndex('sessionId', 'sessionId', { unique: false });
        }
      };
    });
  }

  // Store chunks for a session
  async storeChunks(chunks: Chunk[]): Promise<void> {
    const db = await this.dbPromise;
    const transaction = db.transaction([CHUNKS_STORE], 'readwrite');
    const store = transaction.objectStore(CHUNKS_STORE);

    const storedChunks: StoredChunk[] = chunks.map(chunk => ({
      ...chunk,
      createdAt: Date.now()
    }));

    for (const chunk of storedChunks) {
      store.put(chunk);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Store embedding for a chunk
  async storeEmbedding(chunkId: string, sessionId: string, embedding: number[]): Promise<void> {
    const db = await this.dbPromise;
    const transaction = db.transaction([EMBEDDINGS_STORE], 'readwrite');
    const store = transaction.objectStore(EMBEDDINGS_STORE);

    store.put({
      chunkId,
      sessionId,
      embedding,
      createdAt: Date.now()
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Get all chunks for a session
  async getChunksBySession(sessionId: string): Promise<StoredChunk[]> {
    const db = await this.dbPromise;
    const transaction = db.transaction([CHUNKS_STORE], 'readonly');
    const store = transaction.objectStore(CHUNKS_STORE);
    const index = store.index('sessionId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(sessionId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get embedding for a chunk
  async getEmbedding(chunkId: string): Promise<number[] | null> {
    const db = await this.dbPromise;
    const transaction = db.transaction([EMBEDDINGS_STORE], 'readonly');
    const store = transaction.objectStore(EMBEDDINGS_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get(chunkId);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.embedding : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get all embeddings for a session
  async getEmbeddingsBySession(sessionId: string): Promise<{ chunkId: string; embedding: number[] }[]> {
    const db = await this.dbPromise;
    const transaction = db.transaction([EMBEDDINGS_STORE], 'readonly');
    const store = transaction.objectStore(EMBEDDINGS_STORE);
    const index = store.index('sessionId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(sessionId);
      request.onsuccess = () => {
        const results = request.result.map(item => ({
          chunkId: item.chunkId,
          embedding: item.embedding
        }));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Check if session has embeddings
  async hasEmbeddings(sessionId: string): Promise<boolean> {
    const db = await this.dbPromise;
    const transaction = db.transaction([EMBEDDINGS_STORE], 'readonly');
    const store = transaction.objectStore(EMBEDDINGS_STORE);
    const index = store.index('sessionId');

    return new Promise((resolve, reject) => {
      const request = index.count(sessionId);
      request.onsuccess = () => resolve(request.result > 0);
      request.onerror = () => reject(request.error);
    });
  }

  // Delete all chunks and embeddings for a session
  async deleteSession(sessionId: string): Promise<void> {
    const db = await this.dbPromise;
    
    // Delete chunks
    await new Promise<void>((resolve, reject) => {
      const chunksTransaction = db.transaction([CHUNKS_STORE], 'readwrite');
      const chunksStore = chunksTransaction.objectStore(CHUNKS_STORE);
      const chunksIndex = chunksStore.index('sessionId');
      
      const chunksRequest = chunksIndex.openCursor(sessionId);
      chunksRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      chunksTransaction.oncomplete = () => resolve();
      chunksTransaction.onerror = () => reject(chunksTransaction.error);
    });

    // Delete embeddings
    await new Promise<void>((resolve, reject) => {
      const embeddingsTransaction = db.transaction([EMBEDDINGS_STORE], 'readwrite');
      const embeddingsStore = embeddingsTransaction.objectStore(EMBEDDINGS_STORE);
      const embeddingsIndex = embeddingsStore.index('sessionId');
      
      const embeddingsRequest = embeddingsIndex.openCursor(sessionId);
      embeddingsRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      embeddingsTransaction.oncomplete = () => resolve();
      embeddingsTransaction.onerror = () => reject(embeddingsTransaction.error);
    });
  }

  // Clear all data
  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    const transaction = db.transaction([CHUNKS_STORE, EMBEDDINGS_STORE], 'readwrite');
    
    transaction.objectStore(CHUNKS_STORE).clear();
    transaction.objectStore(EMBEDDINGS_STORE).clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

// Singleton instance
let dbInstance: ChunkDB | null = null;

export function getChunkDB(): ChunkDB {
  if (!dbInstance) {
    dbInstance = new ChunkDB();
  }
  return dbInstance;
}