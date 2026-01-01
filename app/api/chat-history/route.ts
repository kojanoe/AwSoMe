import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface ChatHistoryData {
  sessionId: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  lastUpdated: number;
}

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

    const chatHistoryPath = path.join(
      process.cwd(),
      'data',
      'sessions',
      sessionId,
      `chat-history-${sessionId}.json`
    );

    // If file doesn't exist, return empty history
    if (!fs.existsSync(chatHistoryPath)) {
      return NextResponse.json({
        sessionId,
        messages: [],
        lastUpdated: Date.now(),
      });
    }

    const fileContent = fs.readFileSync(chatHistoryPath, 'utf-8');
    const history: ChatHistoryData = JSON.parse(fileContent);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Chat history GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, messages } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'messages must be an array' },
        { status: 400 }
      );
    }

    const sessionDir = path.join(
      process.cwd(),
      'data',
      'sessions',
      sessionId
    );

    // Ensure session directory exists
    if (!fs.existsSync(sessionDir)) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const chatHistoryPath = path.join(
      sessionDir,
      `chat-history-${sessionId}.json`
    );

    const historyData: ChatHistoryData = {
      sessionId,
      messages,
      lastUpdated: Date.now(),
    };

    fs.writeFileSync(chatHistoryPath, JSON.stringify(historyData, null, 2));

    return NextResponse.json({
      success: true,
      messageCount: messages.length,
    });
  } catch (error) {
    console.error('Chat history POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}