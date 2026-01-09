import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { 
  detectDataType, 
  parseInstagramFile, 
  combineInstagramData
} from '@/lib/data/parser';
import { createDataWrapper } from '@/lib/data/dataWrapper';
import { generateStatsSnapshot } from '@/lib/stats/generateSnapshot';
import type { ParsedFile } from '@/types/instagram';

const REQUIRED_FILES = [
  'ads_viewed.json',
  'posts_viewed.json',
  'videos_watched.json',
  'following.json',
  'link_history.json',
  'place_searches.json',
  'profile_searches.json',
  'word_or_phrase_searches.json',
  'liked_comments.json',
  'liked_posts.json',
  'ads_clicked.json',
  'saved_posts.json'
];

function findAllJsonFiles(dir: string): string[] {
  const jsonFiles: string[] = [];
  
  function traverse(currentPath: string) {
    if (!fs.existsSync(currentPath)) return;
    
    const items = fs.readdirSync(currentPath);
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (stat.isFile() && item.endsWith('.json')) {
        jsonFiles.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return jsonFiles;
}

function processFiles(sessionDir: string, logs: string[], dateRange: { start: number; end: number } | null) {
  const jsonFiles = findAllJsonFiles(sessionDir).filter(f => !f.endsWith('date-range.json'));
  logs.push(`Found ${jsonFiles.length} JSON files`);
  
  if (jsonFiles.length === 0) {
    throw new Error('No JSON files found in session directory');
  }
  
  const foundFiles = jsonFiles.map(f => path.basename(f));
  const missingFiles = REQUIRED_FILES.filter(required => !foundFiles.includes(required));
  
  if (missingFiles.length > 0) {
    logs.push(`Warning: ${missingFiles.length} file(s) missing: ${missingFiles.join(', ')}`);
  } else {
    logs.push('All 11 required files found');
  }
  
  const parsedFiles: ParsedFile[] = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (const filePath of jsonFiles) {
    const filename = path.basename(filePath);
    const relativePath = path.relative(sessionDir, filePath);
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      const type = detectDataType(data, filename);
      
      if (type === 'unknown') {
        logs.push(`[WARNING] ${relativePath}: Could not detect type`);
        errorCount++;
        continue;
      }
      
      const parsed = parseInstagramFile(data, type, dateRange || undefined);
      
      if (parsed.length > 0) {
        parsedFiles.push({
          type,
          filename,
          recordCount: parsed.length,
          success: true,
          data: parsed
        });
        logs.push(`[OK] ${relativePath}: ${type} -> ${parsed.length} items`);
        successCount++;
      } else {
        logs.push(`[WARNING] ${relativePath}: ${type} -> 0 items`);
        errorCount++;
      }
      
    } catch (error) {
      logs.push(`[ERROR] ${relativePath}: ${(error as Error).message}`);
      errorCount++;
    }
  }
  
  return { parsedFiles, successCount, errorCount };
}

function generateAndSaveData(sessionId: string, sessionDir: string, parsedFiles: ParsedFile[], logs: string[]) {
  // Create structured data with sessionId in filename
  const combined = combineInstagramData(parsedFiles);
  const structuredFile = path.join(sessionDir, `structured-data-${sessionId}.json`);
  fs.writeFileSync(structuredFile, JSON.stringify(combined, null, 2));
  logs.push('Structured data saved');
  
  // Generate snapshot with sessionId in filename
  const wrapper = createDataWrapper(combined);
  const snapshot = generateStatsSnapshot(wrapper, sessionId);
  const snapshotFile = path.join(sessionDir, `snapshot-${sessionId}.json`);
  fs.writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2));
  logs.push('Snapshot saved');
  
  const summary: Record<string, number> = {};
  for (const [key, value] of Object.entries(combined)) {
    if (Array.isArray(value) && value.length > 0) {
      summary[key] = value.length;
    }
  }
  
  return { summary };
}

function deleteRawFiles(sessionDir: string, logs: string[]) {
  try {
    const items = fs.readdirSync(sessionDir);
    let deletedCount = 0;
    
    for (const item of items) {
      // Keep these files (with or without sessionId in name)
      if (item.startsWith('structured-data-') || 
          item.startsWith('snapshot-') || 
          item.startsWith('consent-') ||
          item.startsWith('chat-history-') ||
          item.startsWith('date-range-')) {
        continue;
      }
      
      // Delete everything else (raw uploaded files)
      const itemPath = path.join(sessionDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isFile()) {
        fs.unlinkSync(itemPath);
        deletedCount++;
      }
    }
    
    logs.push(`Deleted ${deletedCount} raw files`);
  } catch (error) {
    logs.push(`Warning: Failed to delete raw files: ${(error as Error).message}`);
  }
}

export async function POST(request: NextRequest) {
  const logs: string[] = [];
  
  try {
    logs.push('Starting data generation...');
    
    const body = await request.json();
    
    if (!body.sessionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'sessionId is required',
        logs
      }, { status: 400 });
    }
    
    const sessionId = body.sessionId;
    logs.push(`Processing session: ${sessionId}`);
    
    const sessionDir = path.join(process.cwd(), 'data', 'sessions', sessionId);
    
    if (!fs.existsSync(sessionDir)) {
      return NextResponse.json({ 
        success: false, 
        error: `Session directory not found: ${sessionId}`,
        logs
      }, { status: 404 });
    }
    
    let dateRange: { start: number; end: number } | null = null;
    const dateRangeFile = path.join(sessionDir, `date-range-${sessionId}.json`);

    if (fs.existsSync(dateRangeFile)) {
      dateRange = JSON.parse(fs.readFileSync(dateRangeFile, 'utf8'));
      logs.push(`Date range filter loaded`);
    }
    
    const { parsedFiles, successCount, errorCount } = processFiles(sessionDir, logs, dateRange);
    const { summary } = generateAndSaveData(sessionId, sessionDir, parsedFiles, logs);
    
    // Delete raw files after successful processing
    deleteRawFiles(sessionDir, logs);
    
    logs.push('Data generation complete');
    
    return NextResponse.json({
      success: true,
      sessionId,
      successCount,
      errorCount,
      summary,
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