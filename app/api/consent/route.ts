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

    // Read consent file
    const consentPath = join(
      process.cwd(),
      'data',
      'sessions',
      sessionId,
      `consent-${sessionId}.json`
    );

    const fileContent = await readFile(consentPath, 'utf-8');
    const consent = JSON.parse(fileContent);

    return NextResponse.json(consent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { hasConsented: false },
        { status: 200 }
      );
    }

    console.error('Consent API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}