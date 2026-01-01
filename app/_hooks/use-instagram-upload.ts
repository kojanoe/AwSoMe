import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { detectInstagramFiles, getRequiredFiles } from '@/lib/upload/fileDetection';
import { saveConsent } from '@/lib/consents/consentStore';

// Helper function to recursively extract timestamps from JSON
function extractTimestamps(obj: any, timestamps: number[]): void {
  if (!obj || typeof obj !== 'object') return;

  if (typeof obj.timestamp === 'number' && obj.timestamp > 0) {
    timestamps.push(obj.timestamp);
  }

  if (Array.isArray(obj)) {
    obj.forEach(item => extractTimestamps(item, timestamps));
  } else {
    Object.values(obj).forEach(value => extractTimestamps(value, timestamps));
  }
}

// Scan date range from content files only
async function scanContentDateRange(files: Map<string, File>): Promise<{ 
  earliest: Date; 
  latest: Date;
  earliestTimestamp: number;
  latestTimestamp: number;
} | null> {
  const contentFiles = ['videos_watched.json', 'ads_viewed.json', 'posts_viewed.json'];
  const fileRanges: Record<string, { earliest: number; latest: number; count: number }> = {};

  for (const [filename, file] of files.entries()) {
    if (!contentFiles.includes(filename)) continue;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const timestamps: number[] = [];
      extractTimestamps(json, timestamps);
      
      if (timestamps.length > 0) {
        timestamps.sort((a, b) => a - b);
        fileRanges[filename] = {
          earliest: timestamps[0],
          latest: timestamps[timestamps.length - 1],
          count: timestamps.length
        };
        
        console.log(`\n${filename}:`);
        console.log(`  Count: ${timestamps.length}`);
        console.log(`  Earliest: ${timestamps[0]} → ${new Date(timestamps[0] * 1000).toLocaleString()}`);
        console.log(`  Latest: ${timestamps[timestamps.length - 1]} → ${new Date(timestamps[timestamps.length - 1] * 1000).toLocaleString()}`);
      }
    } catch (error) {
      console.warn(`Failed to scan ${filename}:`, error);
    }
  }

  if (Object.keys(fileRanges).length === 0) return null;

  // Find latest timestamp
  const allLatest = Math.max(...Object.values(fileRanges).map(r => r.latest));
  
  // Go back 1 week (604800 seconds)
  const ONE_WEEK_SECONDS = 604800;
  const calculatedEarliest = allLatest - ONE_WEEK_SECONDS;

  console.log('\n=== CALCULATED RANGE ===');
  console.log(`Latest: ${allLatest} → ${new Date(allLatest * 1000).toLocaleString()}`);
  console.log(`Earliest (latest - 1 week): ${calculatedEarliest} → ${new Date(calculatedEarliest * 1000).toLocaleString()}`);

  return {
    earliest: new Date(calculatedEarliest * 1000),
    latest: new Date(allLatest * 1000),
    earliestTimestamp: calculatedEarliest,
    latestTimestamp: allLatest,
  };
}

export function useInstagramUpload() {
  const router = useRouter();
  const [files, setFiles] = useState<Map<string, File> | null>(null);
  const [missingFiles, setMissingFiles] = useState<string[]>([]);
  const [hasConsent, setHasConsent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMissingFilesDialog, setShowMissingFilesDialog] = useState(false);
  const [detectedDateRange, setDetectedDateRange] = useState<{ 
    earliest: Date; 
    latest: Date;
    earliestTimestamp: number;
    latestTimestamp: number;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const requiredFiles = getRequiredFiles();

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const result = detectInstagramFiles(e.target.files);
    
    setFiles(result.matched);
    setMissingFiles(result.missing);
    setError(null);
    setHasConsent(false);

    // Scan date range from content files
    if (result.matched.size > 0) {
      setIsScanning(true);
      try {
        const range = await scanContentDateRange(result.matched);
        if (range) {
          setDetectedDateRange(range);
        }
      } catch (err) {
        console.error('Failed to scan date range:', err);
      } finally {
        setIsScanning(false);
      }
    }
  };

  const handleProcess = () => {
    if (missingFiles.length > 0) {
      setShowMissingFilesDialog(true);
    } else {
      processFiles();
    }
  };

  const processFiles = async () => {
    if (!files || !detectedDateRange) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Read all files as JSON
      const filesObject: Record<string, any> = {};
      
      for (const [filename, file] of files.entries()) {
        const text = await file.text();
        const json = JSON.parse(text);
        filesObject[filename] = json;
      }

      // Step 2: Upload files with detected date range
      const uploadResponse = await fetch('/api/upload-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          files: filesObject,
          dateRange: {
            start: detectedDateRange.earliestTimestamp,
            end: detectedDateRange.latestTimestamp,
          }
        })
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload files');
      }

      const uploadResult = await uploadResponse.json();
      const sessionId = uploadResult.sessionId;

      // Step 3: Generate data
      const generateResponse = await fetch('/api/generate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || 'Failed to generate data');
      }

      // Step 4: Redirect to dashboard
      await new Promise(resolve => setTimeout(resolve, 4000));
      router.push(`/dashboard?user=${sessionId}`);

    } catch (err) {
      setError((err as Error).message);
      setIsProcessing(false);
    }
  };

  const getFileStatus = (filename: string): 'Ready' | 'Missing' => {
    return files?.has(filename) ? 'Ready' : 'Missing';
  };

  return {
    files,
    missingFiles,
    hasConsent,
    setHasConsent,
    isProcessing,
    error,
    showMissingFilesDialog,
    setShowMissingFilesDialog,
    requiredFiles,
    handleFolderSelect,
    handleProcess,
    processFiles,
    getFileStatus,
    detectedDateRange,
    isScanning,
  };
}