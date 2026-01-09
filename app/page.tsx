'use client';

import { FileUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/shared/confirmDialog';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { useInstagramUpload } from '@/app/_hooks/use-instagram-upload';
import { LoadingOverlay } from '@/components/shared/loadingOverlay';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function HomePage() {
  const {
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
  } = useInstagramUpload();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
      {/* Hero Section */}
      <div className="mb-16">
        <div className="relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute top-20 right-1/4 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl" />
          </div>
          
          <div className="text-center py-12">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
              AwSoMe
            </h1>
            
            <p className="text-2xl md:text-3xl mb-6">
              <span className="font-bold text-foreground">Aw</span>
              <span className="text-muted-foreground">areness on </span>
              <span className="font-bold text-foreground">So</span>
              <span className="text-muted-foreground">cial </span>
              <span className="font-bold text-foreground">Me</span>
              <span className="text-muted-foreground">dia</span>
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Gain deep insights into your Instagram usage patterns and understand how you interact with social media.
            </p>
          </div>
        </div>
      </div>

      {/* Instagram Insights Section */}
      <div className="mb-12">
        <div className="relative mb-8">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-chart-2 rounded-full" />
          
          <div className="pl-6">
            <h2 className="text-2xl font-semibold">
              Instagram Insights
            </h2>
            
            <div className="space-y-6">
              <p className="text-base text-muted-foreground leading-relaxed">
                Upload your Instagram data export to discover your behavior:
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Instructions */}
      <Collapsible className="mb-8">
        <CollapsibleTrigger className="flex items-center gap-2 text-lg font-semibold hover:text-primary transition-colors">
          <ChevronDown className="h-5 w-5 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
          How to download your Instagram data
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4 text-muted-foreground">
          <ol className="list-decimal list-inside space-y-3 ml-2">
            <li>Log in to Instagram on a web browser</li>
            <li>
              Visit{' '}
              <a 
                href="https://accountscenter.instagram.com/info_and_permissions/dyi/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                accountscenter.instagram.com/info_and_permissions/dyi
              </a>
            </li>
            <li>Click <strong>"Create Export"</strong></li>
            <li>Select <strong>"Export to device"</strong></li>
            <li>Change format to <strong>JSON</strong> and date range to <strong>"Last month"</strong>, then save changes</li>
            <li>Click <strong>"Start the Export"</strong> and enter your password</li>
            <li>Wait for Instagram's email (usually 1-48 hours)</li>
            <li>Return to the link above, download the ZIP file, and extract it</li>
            <li>Upload the extracted folder below</li>
          </ol>
        </CollapsibleContent>
      </Collapsible>

      {/* Upload Section */}
      <div className="mb-16">
        {/* Error display - show regardless of files state */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty state - show when no files uploaded */}
        {!files && (
          <div className="relative">
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
                  /* @ts-ignore */
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

        {/* File list and processing */}
        {files && (
          <div className="space-y-6">
            <Card className="shadow-lg shadow-primary/5 border-primary/10">
              <CardHeader>
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
                    {requiredFiles.map((filename: string) => {
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

            {isScanning && (
              <Card className="shadow-lg shadow-primary/5 border-primary/10">
                <CardContent className="py-8">
                  <div className="flex items-center justify-center gap-3">
                    <Spinner />
                    <p className="text-muted-foreground">Scanning date range...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {detectedDateRange && !isScanning && (
              <Card className="shadow-lg shadow-primary/5 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-2xl">Date Range</CardTitle>
                  <CardDescription className="text-base">
                    Automatic data filtering applied
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground mb-3">
                        Your data will be cleaned to only include activity from:
                      </p>
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-primary">
                            {detectedDateRange.earliest.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {detectedDateRange.earliest.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-2xl text-muted-foreground">→</div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-primary">
                            {detectedDateRange.latest.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {detectedDateRange.latest.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      All searches, follows, and other activities outside this range will be automatically filtered out
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-lg shadow-primary/5 border-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl">Process Data</CardTitle>
                <CardDescription className="text-base">Review and consent to continue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showMissingFilesDialog}
        onOpenChange={setShowMissingFilesDialog}
        onConfirm={() => {
          setShowMissingFilesDialog(false);
          processFiles();
        }}
        title="Missing Required Files"
        description="Some required files are missing from your upload. Your insights may be incomplete or inaccurate."
        confirmText="Continue Anyway"
      >
        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-sm font-medium mb-2">Missing files:</p>
          <ul className="text-sm space-y-1">
            {missingFiles.map((file: string) => (
              <li key={file} className="font-mono">
                {file}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-muted-foreground">Do you want to continue anyway?</p>
      </ConfirmDialog>
      <LoadingOverlay isVisible={isProcessing} />
    </div>
  );
}