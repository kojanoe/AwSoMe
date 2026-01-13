import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const snapshotPath = join(
    process.cwd(), 
    'data', 
    'sessions', 
    sessionId, 
    `snapshot-${sessionId}.json`
  );
  
  const data = await readFile(snapshotPath, 'utf-8');
  
  return new Response(data, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${sessionId}.json"`,
    },
  });
}