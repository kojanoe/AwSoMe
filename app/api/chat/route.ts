import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input: messages must be a non-empty array' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Build system message with context from RAG
    const systemMessage = {
      role: 'system',
      content: context 
        ? `You're analyzing someone's Instagram usage. Be conversational and concise - like texting a friend who knows data.

Context from their data:
${context}

Rules:
- Use their actual data in responses (numbers, times, patterns)
- Keep responses SHORT (2-3 sentences max unless asked for detail)
- Be direct and casual, not formal
- Don't give generic advice - be specific to THEIR patterns
- Don't end with "let me know if you have questions" or similar phrases
- If asked something not in the data, just say "I don't have that info" briefly`
        : 'You are analyzing Instagram usage data. Be conversational and concise.'
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: 'OpenAI API error', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      message: data.choices[0].message.content,
      usage: data.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}