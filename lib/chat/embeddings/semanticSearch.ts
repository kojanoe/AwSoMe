import { getChunkDB, StoredChunk } from '@/lib/data/chunkDB';

// Calculate cosine similarity between two vectors

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// Get embedding from API
async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('/api/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      texts: [text],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get embedding');
  }

  const data = await response.json();
  return data.embeddings[0];
}

export interface SearchResult {
  chunk: StoredChunk;
  similarity: number;
}

// Search for most relevant chunks using semantic similarity
export async function semanticSearch(
  query: string,
  sessionId: string,
  topK: number = 5
): Promise<SearchResult[]> {
  const db = getChunkDB();
  // Get query embedding
  const queryEmbedding = await getEmbedding(query);
  // Get all chunks and their embeddings for this session
  const chunks = await db.getChunksBySession(sessionId);
  const embeddings = await db.getEmbeddingsBySession(sessionId);
  // Create map of chunkId -> embedding
  const embeddingMap = new Map(
    embeddings.map(e => [e.chunkId, e.embedding])
  );

  // Calculate similarity for each chunk
  const results: SearchResult[] = [];

  for (const chunk of chunks) {
    const chunkEmbedding = embeddingMap.get(chunk.id);
    if (!chunkEmbedding) {
      console.warn(`No embedding found for chunk ${chunk.id}`);
      continue;
    }
    const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding); 
    results.push({
      chunk,
      similarity,
    });
  }

  // Sort by similarity (highest first) and return top K
  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topK);
}

//  Generate context string from search results
export function buildContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return '';
  }
  return results
    .map((result, index) => 
      `[${index + 1}] ${result.chunk.content}`
    )
    .join('\n\n');
}

// Generate embeddings for all chunks and store them
export async function generateEmbeddingsForSession(sessionId: string): Promise<void> {
  const db = getChunkDB();
  // Check if embeddings already exist
  const hasEmbeddings = await db.hasEmbeddings(sessionId);
  if (hasEmbeddings) {
    console.log('Embeddings already exist for session:', sessionId);
    return;
  }

  // Get chunks
  const chunks = await db.getChunksBySession(sessionId);
  if (chunks.length === 0) {
    throw new Error('No chunks found for session');
  }

  // Get embeddings for all chunks in one API call (batch)
  const texts = chunks.map(c => c.content);
  const response = await fetch('/api/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      texts,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate embeddings');
  }
  const data = await response.json();
  const embeddings = data.embeddings;
  // Store embeddings
  for (let i = 0; i < chunks.length; i++) {
    await db.storeEmbedding(chunks[i].id, sessionId, embeddings[i]);
  }

  console.log(`Generated and stored ${embeddings.length} embeddings`);
}