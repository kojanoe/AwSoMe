/**
 * Content Sources Chart
 * Simple stacked bar visualization
 */

'use client';

interface ContentSourcesChartProps {
  intended: number;
  suggested: number;
  ads: number;
  intendedCount: number;
  suggestedCount: number;
  adsCount: number;
}

export function ContentSourcesChart({ 
  intended, 
  suggested, 
  ads,
  intendedCount,
  suggestedCount,
  adsCount
}: ContentSourcesChartProps) {
  // Ensure valid numbers
  const safeIntended = Number(intended) || 0;
  const safeSuggested = Number(suggested) || 0;
  const safeAds = Number(ads) || 0;
  const safeIntendedCount = Number(intendedCount) || 0;
  const safeSuggestedCount = Number(suggestedCount) || 0;
  const safeAdsCount = Number(adsCount) || 0;

  return (
    <div className="space-y-6">
      {/* Simple Stacked Bar */}
      <div className="h-12 bg-secondary rounded-lg overflow-hidden flex">
        {safeIntended > 0 && (
          <div 
            className="bg-chart-1 flex items-center justify-center text-sm font-medium text-white transition-all"
            style={{ width: `${safeIntended}%` }}
          >
            {safeIntended > 10 && `${safeIntended}%`}
          </div>
        )}
        
        {safeSuggested > 0 && (
          <div 
            className="bg-chart-2 flex items-center justify-center text-sm font-medium text-white transition-all"
            style={{ width: `${safeSuggested}%` }}
          >
            {safeSuggested > 10 && `${safeSuggested}%`}
          </div>
        )}
        
        {safeAds > 0 && (
          <div 
            className="bg-chart-3 flex items-center justify-center text-sm font-medium text-white transition-all"
            style={{ width: `${safeAds}%` }}
          >
            {safeAds > 10 && `${safeAds}%`}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Intended */}
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-chart-1 flex-shrink-0" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-m">Intended Content</span>
              <span className="text-xs text-muted-foreground">{safeIntended}%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {safeIntendedCount.toLocaleString()} items from accounts you follow or searched
            </p>
          </div>
        </div>

        {/* Suggested */}
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-chart-2 flex-shrink-0" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-m">Suggested Content</span>
              <span className="text-xs text-muted-foreground">{safeSuggested}%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {safeSuggestedCount.toLocaleString()} items recommended by the algorithm
            </p>
          </div>
        </div>

        {/* Ads */}
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-chart-3 flex-shrink-0" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-m">Ads</span>
              <span className="text-xs text-muted-foreground">{safeAds}%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {safeAdsCount.toLocaleString()} sponsored posts shown to you
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}