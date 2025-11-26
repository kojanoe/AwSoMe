import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { 
  detectDataType, 
  parseInstagramFile, 
  combineInstagramData
} from '@/lib/data/parser';
import type { ParsedFile } from '@/types/instagram';

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

export async function GET() {
  const logs: string[] = [];
  
  try {
    logs.push('Starting data generation...');
    
    const rawDataDir = path.join(process.cwd(), 'data', 'rawdata');
    const outputDir = path.join(process.cwd(), 'data', 'generatedData');
    const outputFile = path.join(outputDir, 'structured-data.json');
    
    if (!fs.existsSync(rawDataDir)) {
      return NextResponse.json({ 
        success: false, 
        error: 'data/rawdata directory not found',
        path: rawDataDir 
      });
    }
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      logs.push('Created output directory');
    }
    
    const jsonFiles = findAllJsonFiles(rawDataDir);
    logs.push(`Found ${jsonFiles.length} JSON files`);
    
    if (jsonFiles.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No JSON files found in data/rawdata/' 
      });
    }
    
    const parsedFiles: ParsedFile[] = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const filePath of jsonFiles) {
      const filename = path.basename(filePath);
      const relativePath = path.relative(rawDataDir, filePath);
      
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
    
    const combined = combineInstagramData(parsedFiles);
    fs.writeFileSync(outputFile, JSON.stringify(combined, null, 2));
    
    const summary: Record<string, number> = {};
    for (const [key, value] of Object.entries(combined)) {
      if (value.length > 0) {
        summary[key] = value.length;
      }
    }
    
    logs.push('Data generation complete!');
    
    return NextResponse.json({
      success: true,
      successCount,
      errorCount,
      outputFile,
      summary,
      logs
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      logs
    }, { status: 500 });
  }
}