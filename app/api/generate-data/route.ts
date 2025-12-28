import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { 
  detectDataType, 
  parseInstagramFile, 
  combineInstagramData
} from '@/lib/data/parser';
import { createDataStore } from '@/lib/data/dataStore';
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
  'recommended_topics.json',
  'liked_comments.json',
  'liked_posts.json'
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

function processFiles(sessionDir: string, logs: string[]) {
  const jsonFiles = findAllJsonFiles(sessionDir);
  logs.push(`Found ${jsonFiles.length} JSON files`);
  
  if (jsonFiles.length === 0) {
    throw new Error('No JSON files found in session directory');
  }
  
  // Check for missing files
  const foundFiles = jsonFiles.map(f => path.basename(f));
  const missingFiles = REQUIRED_FILES.filter(required => !foundFiles.includes(required));
  
  if (missingFiles.length > 0) {
    logs.push(`Warning: ${missingFiles.length} file(s) missing: ${missingFiles.join(', ')}`);
  } else {
    logs.push('All 11 required files found');
  }
  
  // Parse all files
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
      
      const parsed = parseInstagramFile(data, type);
      
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

function generateAndSaveData(sessionId: string, outputDir: string, parsedFiles: ParsedFile[], logs: string[]) {
  // Create output directory if needed
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    logs.push('Created output directory');
  }
  
  // structured data
  const combined = combineInstagramData(parsedFiles);
  const structuredFile = path.join(outputDir, `structured-data-${sessionId}.json`);
  fs.writeFileSync(structuredFile, JSON.stringify(combined, null, 2));
  logs.push('✓ Structured data saved');
  
  // snapshot
  const store = createDataStore(combined);
  const snapshot = generateStatsSnapshot(store, sessionId);
  const snapshotFile = path.join(outputDir, `snapshot-${sessionId}.json`);
  fs.writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2));
  logs.push('✓ Stats snapshot generated');
  
  // Create summary
  const summary: Record<string, number> = {};
  for (const [key, value] of Object.entries(combined)) {
    if (Array.isArray(value) && value.length > 0) {
      summary[key] = value.length;
    }
  }
  
  return { summary };
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
    
    const sessionDir = path.join(process.cwd(), 'data', 'rawdata', sessionId);
    const outputDir = path.join(process.cwd(), 'data', 'generatedData');
    
    if (!fs.existsSync(sessionDir)) {
      return NextResponse.json({ 
        success: false, 
        error: `Session directory not found: ${sessionId}`,
        logs
      }, { status: 404 });
    }
    
    // Process files
    const { parsedFiles, successCount, errorCount } = processFiles(sessionDir, logs);
    
    // Generate and save data
    const { summary } = generateAndSaveData(sessionId, outputDir, parsedFiles, logs);
    
    logs.push('Data generation complete!');
    
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