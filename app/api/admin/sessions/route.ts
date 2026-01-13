import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  const sessionsPath = join(process.cwd(), 'data', 'sessions');
  const sessionIds = await readdir(sessionsPath);
  
  const sessions = await Promise.all(
    sessionIds.map(async (id) => {
      const sessionPath = join(sessionsPath, id);
      const files = await readdir(sessionPath);
      const stats = await stat(sessionPath);
      
      return {
        id,
        fileCount: files.length,
        modified: stats.mtime.toISOString(),
        hasSnapshot: files.includes(`snapshot-${id}.json`),
      };
    })
  );
  
  return Response.json({ sessions, total: sessions.length });
}