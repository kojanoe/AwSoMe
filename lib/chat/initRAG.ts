import { getChunkDB } from '@/lib/data/chunkDB';
import { chunkSnapshot } from '@/lib/chat/chunking/chunkData';
import { generateEmbeddingsForSession } from '@/lib/chat/embeddings/semanticSearch';
import { StatsSnapshot } from '@/types/snapshot';

// Initialize RAG data for session
export async function initializeRAG(sessionId: string): Promise<void> {
  const db = getChunkDB();

  // Check if embeddings already exist
  const hasEmbeddings = await db.hasEmbeddings(sessionId);
  
  if (hasEmbeddings) {
    console.log('RAG already initialized for session:', sessionId);
    return;
  }

  console.log('Initializing RAG for session:', sessionId);

  // Load snapshot from server
  const snapshot = await loadSnapshot(sessionId);
  if (!snapshot) {
    throw new Error('Snapshot not found');
  }
  // Check if chunks exist
  const existingChunks = await db.getChunksBySession(sessionId);
  if (existingChunks.length === 0) {
    // Generate chunks from snapshot
    console.log('Generating chunks...');
    const chunks = chunkSnapshot(snapshot);
    
    // Store chunks
    await db.storeChunks(chunks);
    console.log(`Stored ${chunks.length} chunks`);
  }

  // Generate embeddings (batch API call)
  console.log('Generating embeddings...');
  await generateEmbeddingsForSession(sessionId);
  
  console.log('RAG initialization complete');
}

// Load snapshot from server
async function loadSnapshot(sessionId: string): Promise<StatsSnapshot | null> {
  try {
    const response = await fetch(`/api/snapshot?sessionId=${sessionId}`);
    
    if (!response.ok) {
      return null;
    }
    
    const snapshot = await response.json();
    return snapshot;
  } catch (error) {
    console.error('Failed to load snapshot:', error);
    return null;
  }
}

// Check if RAG is ready for a session
export async function isRAGReady(sessionId: string): Promise<boolean> {
  const db = getChunkDB();
  return await db.hasEmbeddings(sessionId);
}