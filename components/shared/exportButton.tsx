'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ExportButtonProps {
  type: 'dashboard' | 'chat';
  data: any;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ExportButton({ 
  type, 
  data, 
  variant = 'outline', 
  size = 'sm',
  className 
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  const downloadJSON = () => {
    const filename = type === 'dashboard' 
      ? `instagram-dashboard-${Date.now()}.json`
      : `chat-history-${Date.now()}.json`;
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const downloadTXT = () => {
    if (type === 'chat') {
      // Format chat messages as readable text
      const text = data.messages
        ?.map((msg: any) => `[${msg.role.toUpperCase()}]: ${msg.content}`)
        .join('\n\n');
      
      const blob = new Blob([text || ''], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-history-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // For dashboard, create a readable summary
      const text = generateDashboardSummary(data);
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instagram-summary-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setOpen(false);
  };

  const generateDashboardSummary = (data: any) => {
    return `
INSTAGRAM USAGE SUMMARY
Generated: ${new Date().toLocaleString()}

=== OVERVIEW ===
Posts Viewed: ${data.overview?.totalPostsViewed || 0}
Videos Watched: ${data.overview?.totalVideosWatched || 0}
Ads Viewed: ${data.overview?.totalAdsViewed || 0}
Likes Given: ${data.overview?.totalLikesGiven || 0}
Comments Liked: ${data.overview?.totalCommentsLiked || 0}

=== CONTENT SOURCES ===
Intended Content: ${data.contentRatio?.intendedContent || 0} (${data.contentPercentages?.intended || 0}%)
Suggested Content: ${data.contentRatio?.suggestedContent || 0} (${data.contentPercentages?.suggested || 0}%)
Ads: ${data.contentRatio?.adsViewed || 0} (${data.contentPercentages?.ads || 0}%)

=== ENGAGEMENT ===
Suggested Content Engagement: ${data.engagementPercentages?.suggested || 0}%
Ads Engagement: ${data.engagementPercentages?.ads || 0}%

=== BEHAVIORAL PATTERNS ===
Total Binge Sessions: ${data.behavioral?.bingeWatching?.totalBingeSessions || 0}
Total Searches: ${data.behavioral?.searchBehavior?.totalSearches || 0}
    `.trim();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Export {type === 'dashboard' ? 'Dashboard Data' : 'Chat History'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {type === 'dashboard' 
              ? 'Download your Instagram usage statistics and insights'
              : 'Download your conversation history'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3 pt-4">
          <Button 
            onClick={downloadJSON} 
            variant="outline" 
            className="w-full justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">JSON Format</div>
              <div className="text-xs text-muted-foreground">
                For data analysis and processing
              </div>
            </div>
          </Button>

          <Button 
            onClick={downloadTXT} 
            variant="outline" 
            className="w-full justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">Text Format</div>
              <div className="text-xs text-muted-foreground">
                {type === 'dashboard' 
                  ? 'Readable summary of your statistics'
                  : 'Plain text conversation'
                }
              </div>
            </div>
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}