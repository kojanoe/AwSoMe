'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUp, AlertCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { detectInstagramFiles, getRequiredFiles } from '@/lib/upload/fileDetection';

export default function HomePage() {
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
      router.push(`/test?user=${sessionId}`);

    } catch (err) {
      setError((err as Error).message);
      setIsProcessing(false);
    }
  };

  const getFileStatus = (filename: string): 'Ready' | 'Missing' => {
    return files?.has(filename) ? 'Ready' : 'Missing';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
      {/* Hero Section */}
      <div className="mb-16">
        {/* Gradient background effect */}
        <div className="relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute top-20 right-1/4 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl" />
          </div>
          
          <div className="text-center py-12">
            {/* Main title with gradient */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
              AwSoMe
            </h1>
            
            {/* Subtitle with accent */}
            <p className="text-2xl md:text-3xl mb-6">
              <span className="font-bold text-foreground">Aw</span>
              <span className="text-muted-foreground">areness on </span>
              <span className="font-bold text-foreground">So</span>
              <span className="text-muted-foreground">cial </span>
              <span className="font-bold text-foreground">Me</span>
              <span className="text-muted-foreground">dia</span>
            </p>
            
            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Gain deep insights into your Instagram usage patterns and understand how you interact with social media.
            </p>
          </div>
        </div>
      </div>

      {/* Instagram Insights Section */}
      <div className="mb-12">
        <div className="relative mb-8">
          {/* Accent line */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-chart-2 rounded-full" />
          
          <div className="pl-6">
            {/* Standardized header - text-2xl font-bold */}
            <h2 className="text-2xl font-semibold">
              Instagram Insights
            </h2>
            
            <div className="space-y-6">
              <p className="text-base text-muted-foreground leading-relaxed">
                Upload your Instagram data export to discover your behavior:
              </p>
              
              {/* Feature list with modern styling */}
              <div className="space-y-3">
                {[
                  'How much time you spend on Instagram',
                  'Your most active hours and days',
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary group-hover:scale-150 transition-transform" />
                    <p className="text-base text-muted-foreground group-hover:text-foreground transition-colors">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-16">
        {/* Empty state - show when no files uploaded */}
        {!files && (
          <div className="relative">
            {/* Glassmorphism effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-chart-2/5 rounded-2xl blur-2xl" />
            
            <Empty className="relative border-2 border-dashed border-primary/30 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <div className="p-4 rounded-full bg-primary/10">
                    <FileUp className="text-primary" />
                  </div>
                </EmptyMedia>
                <EmptyTitle className="text-xl">No Files Selected</EmptyTitle>
                <EmptyDescription className="text-base">
                  Select your Instagram data export files to begin analysis.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <label htmlFor="folder-upload">
                  <Button size="lg" className="shadow-lg shadow-primary/20" asChild>
                    <span>Select Files</span>
                  </Button>
                </label>
                <input
                  id="folder-upload"
                  type="file"
                  /* @ts-ignore - webkitdirectory is not in types but works in all modern browsers */
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleFolderSelect}
                  className="hidden"
                />
              </EmptyContent>
            </Empty>
          </div>
        )}

        {/* File list and processing - show after files uploaded */}
        {files && (
          <div className="space-y-6">
            {/* File list table */}
            <Card className="shadow-lg shadow-primary/5 border-primary/10">
              <CardHeader>
                {/* Standardized CardTitle - same size as h2 sections */}
                <CardTitle className="text-2xl">Detected Files ({files.size}/{requiredFiles.length})</CardTitle>
                <CardDescription className="text-base">
                  Required Instagram data files for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-base">Filename</TableHead>
                      <TableHead className="text-base">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requiredFiles.map((filename) => {
                      const status = getFileStatus(filename);
                      return (
                        <TableRow key={filename}>
                          <TableCell className="font-mono text-base">{filename}</TableCell>
                          <TableCell>
                            {status === 'Ready' ? (
                              <Badge className="bg-green-600 hover:bg-green-700 text-base">
                                Ready
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-base">
                                Missing
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <p className="text-base text-muted-foreground mt-4">
                  Other JSON files in the folder will not be processed.
                </p>
              </CardContent>
            </Card>

            {/* Actions card */}
            <Card className="shadow-lg shadow-primary/5 border-primary/10">
              <CardHeader>
                {/* Standardized CardTitle */}
                <CardTitle className="text-2xl">Process Data</CardTitle>
                <CardDescription className="text-base">Review and consent to continue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Explanatory text */}
                <div className="space-y-3 text-base text-muted-foreground">
                  <p>
                    Your data will be processed locally in your browser and stored securely on our
                    servers. We analyze your Instagram usage patterns to provide personalized
                    insights about your social media behavior.
                  </p>
                  <p>
                    By consenting, you agree to allow us to process your Instagram data for the
                    purpose of generating usage statistics and behavioral insights. Your data is
                    private and will not be shared with third parties.
                  </p>
                </div>

                {/* Consent checkbox */}
                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="consent"
                    checked={hasConsent}
                    onCheckedChange={(checked) => setHasConsent(checked === true)}
                    disabled={isProcessing}
                  />
                  <Label htmlFor="consent" className="text-base leading-relaxed cursor-pointer">
                    I consent to my data being processed
                  </Label>
                </div>

                {/* Process button */}
                <Button
                  onClick={handleProcess}
                  disabled={!hasConsent || isProcessing}
                  className="w-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Spinner className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Analyze Files'
                  )}
                </Button>

                {/* Error alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-base">{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Accordion Placeholder */}
      <div className="mb-16">
        <Card className="shadow-lg shadow-primary/5 border-primary/10">
          <CardHeader>
            {/* Standardized CardTitle */}
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
            <CardDescription className="text-base">
              Common questions about using AwSoMe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Accordion items */}
            {[
              'XX?',
              'XX?',
              'XX?'
            ].map((question, index) => (
              <div
                key={index}
                className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-base font-medium group-hover:text-primary transition-colors">
                    {question}
                  </p>
                  <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Missing files warning dialog */}
      <AlertDialog open={showMissingFilesDialog} onOpenChange={setShowMissingFilesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Missing Required Files</AlertDialogTitle>
            <AlertDialogDescription>
              Some required files are missing from your upload. Your insights may be incomplete or
              inaccurate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium mb-2">Missing files:</p>
            <ul className="text-sm space-y-1">
              {missingFiles.map((file) => (
                <li key={file} className="font-mono">
                  {file}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">Do you want to continue anyway?</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowMissingFilesDialog(false);
                processFiles();
              }}
            >
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}