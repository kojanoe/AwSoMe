import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { NextRequest } from 'next/server';
import JSZip from 'jszip';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const sessionPath = join(process.cwd(), 'data', 'sessions', sessionId);
  
  const files = await readdir(sessionPath);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
  const zip = new JSZip();
  
  for (const file of jsonFiles) {
    const content = await readFile(join(sessionPath, file), 'utf-8');
    zip.file(file, content);
  }
  
    const zipBuffer = await zip.generateAsync({ type: 'blob' });

    return new Response(zipBuffer, {
    headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${sessionId}.zip"`,
    },
    });
}