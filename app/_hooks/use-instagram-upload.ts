import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { detectInstagramFiles, getRequiredFiles } from '@/lib/upload/fileDetection';
import { saveConsent } from '@/lib/consents/consentStore';

export function useInstagramUpload() {
  const router = useRouter();
  const [files, setFiles] = useState<Map<string, File> | null>(null);
  const [missingFiles, setMissingFiles] = useState<string[]>([]);
  const [hasConsent, setHasConsent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMissingFilesDialog, setShowMissingFilesDialog] = useState(false);

  const requiredFiles = getRequiredFiles();

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const result = detectInstagramFiles(e.target.files);
    
    setFiles(result.matched);
    setMissingFiles(result.missing);
    setError(null);
    setHasConsent(false);
  };

  const handleProcess = () => {
    if (missingFiles.length > 0) {
      setShowMissingFilesDialog(true);
    } else {
      processFiles();
    }
  };

  const processFiles = async () => {
    if (!files) return;

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

      // Step 2: Upload files
      const uploadResponse = await fetch('/api/upload-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: filesObject })
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload files');
      }

      const uploadResult = await uploadResponse.json();
      const sessionId = uploadResult.sessionId;

      // Save consent to localStorage
      saveConsent(sessionId);

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
      router.push(`/test?user=${sessionId}`);

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
  };
}