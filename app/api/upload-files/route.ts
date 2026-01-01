import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const REQUIRED_FILES = [
  'ads_viewed.json',
  'posts_viewed.json',
  'videos_watched.json',
  'following.json',
  'link_history.json',
  'place_searches.json',
  'profile_searches.json',
  'word_or_phrase_searches.json',
  'recommended_topics.json',
  'liked_comments.json',
  'liked_posts.json'
];

interface UploadRequest {
  files: Record<string, any>;
  dateRange?: {
    start: number;
    end: number;
  };
}

export async function POST(request: NextRequest) {
  const logs: string[] = [];
  
  try {
    logs.push('Starting file upload...');
    
    const body: UploadRequest = await request.json();
    
    if (!body.files || typeof body.files !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'Invalid request: files object is required',
        logs
      }, { status: 400 });
    }
    
    const sessionId = randomUUID();
    logs.push(`Generated session ID: ${sessionId}`);
    
    const sessionsDir = path.join(process.cwd(), 'data', 'sessions');
    const sessionDir = path.join(sessionsDir, sessionId);
    
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
      logs.push('Created sessions directory');
    }
    
    fs.mkdirSync(sessionDir, { recursive: true });
    logs.push(`Created session directory: ${sessionDir}`);
    
    // Save consent immediately (user has consented by uploading)
    const consentFile = path.join(sessionDir, `consent-${sessionId}.json`);
    const consentData = {
      sessionId,
      hasConsented: true,
      timestamp: Date.now(),
    };
    fs.writeFileSync(consentFile, JSON.stringify(consentData, null, 2));
    logs.push('Consent saved');
    
    // Save date range if provided (with sessionId in filename)
    if (body.dateRange) {
      const dateRangeFile = path.join(sessionDir, `date-range-${sessionId}.json`);
      fs.writeFileSync(dateRangeFile, JSON.stringify(body.dateRange, null, 2));
      logs.push('Saved date range');
    }
        
    const uploadedFiles: string[] = [];
    let savedCount = 0;
    let errorCount = 0;
    
    for (const filename of REQUIRED_FILES) {
      if (body.files[filename]) {
        try {
          const filePath = path.join(sessionDir, filename);
          const fileContent = JSON.stringify(body.files[filename], null, 2);
          fs.writeFileSync(filePath, fileContent, 'utf8');
          uploadedFiles.push(filename);
          savedCount++;
          logs.push(`Saved: ${filename}`);
        } catch (error) {
          logs.push(`Error saving ${filename}: ${(error as Error).message}`);
          errorCount++;
        }
      } else {
        logs.push(`Warning: ${filename} not found in upload`);
      }
    }
    
    logs.push(`Upload complete: ${savedCount} saved, ${errorCount} errors`);
    
    if (savedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files were saved',
        logs
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      sessionId,
      savedCount,
      uploadedFiles,
      logs
    });
    
  } catch (error) {
    logs.push(`Fatal error: ${(error as Error).message}`);
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      logs
    }, { status: 500 });
  }
}