import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Read snapshot file
    const snapshotPath = join(
      process.cwd(),
      'data',
      'generatedData',
      `snapshot-${sessionId}.json`
    );

    const fileContent = await readFile(snapshotPath, 'utf-8');
    const snapshot = JSON.parse(fileContent);

    return NextResponse.json(snapshot);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Snapshot not found' },
        { status: 404 }
      );
    }

    console.error('Snapshot API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}