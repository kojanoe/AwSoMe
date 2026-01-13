import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FloatingChat } from "@/components/chat/chatFloating";
import { Calendar, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ActiveHoursChart } from "@/components/charts/activeHours";
import { ActiveDaysChart } from "@/components/charts/activeDays";
import { SearchDistributionChart } from "@/components/charts/searchDistribution";
import { ExportButton } from '@/components/shared/exportButton';
import { ContentSourcesChart } from "@/components/charts/contentSources";
import { StatsSnapshot } from '@/types/snapshot';
import { readFile } from 'fs/promises';
import { join } from 'path';

async function loadSnapshot(userId: string): Promise<StatsSnapshot> {
  const snapshotPath = join(
    process.cwd(),
    'data',
    'sessions',
    userId,
    `snapshot-${userId}.json`
  );  
  const fileContent = await readFile(snapshotPath, 'utf8');
  return JSON.parse(fileContent);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>
}) {
  const params = await searchParams;
  const userId = params.user || '1';
  
  const snapshot = await loadSnapshot(userId);

  // Helper: Convert percentages back for chart
  const contentPercentages = {
    intended: snapshot.aggregates.contentSources.intended,
    suggested: snapshot.aggregates.contentSources.suggested,
    ads: snapshot.aggregates.contentSources.ads,
  };

  // Helper: Calculate engagement percentages
  const engagementPercentages = {
    suggested: Math.round(snapshot.engagement.suggestedEngagement.engagementRate * 100),
    ads: Math.round(snapshot.engagement.adsEngagement.engagementRate * 100),
  };

  // Helper: Generate engagement summary
  const getEngagementSummary = () => {
    const suggested = engagementPercentages.suggested;
    if (suggested > 10) return `You engage frequently with suggested content (${suggested}% engagement rate)`;
    if (suggested > 5) return `You moderately engage with suggested content (${suggested}% engagement rate)`;
    return `You rarely engage with suggested content (${suggested}% engagement rate)`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-background/95 border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                Your Instagram Insights
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {formatDate(snapshot.dataRange.earliest)} - {formatDate(snapshot.dataRange.latest)}
                </p>
                {userId !== '1' && (
                  <Badge variant="outline" className="ml-2 text-xs">User {userId}</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <ExportButton 
                type="dashboard"
                data={snapshot}
                variant="outline"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Hero Stats Section */}
        <section className="py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/50 transition-all">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                {snapshot.overview.totalPostsViewed.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Posts Viewed</div>
            </div>

            <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/50 transition-all">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                {snapshot.overview.totalVideosWatched.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Videos Watched</div>
            </div>

            <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/50 transition-all">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                {snapshot.overview.totalAdsViewed.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Ads Viewed</div>
            </div>

            <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/50 transition-all">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                {snapshot.overview.totalLikesGiven.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Likes Given</div>
            </div>

            <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/50 transition-all">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                {snapshot.overview.totalCommentsLiked.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Comments Liked</div>
            </div>
          </div>
        </section>

        {/* Content DNA Section */}
        <section className="py-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Content DNA</h2>
            <p className="text-muted-foreground text-sm mt-1">What shapes your feed</p>
          </div>
          
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Where Your Content Comes From</CardTitle>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p>Understand where your Instagram content comes from: accounts you follow (Intended), Instagram's algorithm recommendations (Suggested), or paid advertisements (Ads).</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <ContentSourcesChart 
                intended={contentPercentages.intended}
                suggested={contentPercentages.suggested}
                ads={contentPercentages.ads}
                intendedCount={snapshot.contentRatio.intendedContent}
                suggestedCount={snapshot.contentRatio.suggestedContent}
                adsCount={snapshot.contentRatio.adsViewed}
              />
            </CardContent>
          </Card>
        </section>

        {/* Engagement Score Section */}
        <section className="py-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Engagement Score</h2>
            <p className="text-muted-foreground text-sm mt-1">How you interact with content</p>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">How You Engage With Content</CardTitle>
                  <CardDescription>{getEngagementSummary()}</CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p>See how often you like, save, or click on suggested content and ads. Higher engagement tells Instagram to show you more similar content.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Suggested Content Engagement */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base">Suggested Content</h3>
                    <p className="text-sm text-muted-foreground">
                      How often you like content recommended by Instagram
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Engagement Rate</span>
                      <Badge className="bg-chart-2">{engagementPercentages.suggested}%</Badge>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-chart-2 transition-all" 
                        style={{ width: `${engagementPercentages.suggested}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Viewed</span>
                      <span className="font-medium">{snapshot.engagement.suggestedEngagement.totalViewed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Liked</span>
                      <span className="font-medium">{snapshot.engagement.suggestedEngagement.totalLiked.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Saved</span>
                      <span className="font-medium">{snapshot.engagement.suggestedEngagement.totalSaved.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Ads Engagement */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base">Ads</h3>
                    <p className="text-sm text-muted-foreground">
                      How often you like sponsored content
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Engagement Rate</span>
                      <Badge className="bg-chart-3">{engagementPercentages.ads}%</Badge>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-chart-3 transition-all" 
                        style={{ width: `${engagementPercentages.ads}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Viewed</span>
                      <span className="font-medium">{snapshot.engagement.adsEngagement.totalViewed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Liked</span>
                      <span className="font-medium">{snapshot.engagement.adsEngagement.totalLiked.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Clicked</span>
                      <span className="font-medium">{snapshot.engagement.adsEngagement.totalClicked.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Your Rhythm Section */}
        <section className="py-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Your Rhythm</h2>
            <p className="text-muted-foreground text-sm mt-1">When you use Instagram</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Active Hours */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Most Active Hours</CardTitle>
                    <CardDescription>When you use Instagram the most</CardDescription>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <p>Shows your activity distribution across 24 hours</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <ActiveHoursChart 
                  data={snapshot.behavioral.activeHours.hourlyDistribution}
                  contentBreakdown={snapshot.timeBasedContent.hourly}
                />
              </CardContent>
            </Card>

            {/* Active Days */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Most Active Days</CardTitle>
                    <CardDescription>Your weekly usage pattern</CardDescription>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <p>Shows your activity throughout the week</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <ActiveDaysChart 
                  data={snapshot.behavioral.activeDays.dailyDistribution}
                  contentBreakdown={snapshot.timeBasedContent.daily}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Behavioral Patterns Section */}
        <section className="py-6 pb-20">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Behavioral Patterns</h2>
            <p className="text-muted-foreground text-sm mt-1">Your usage habits and patterns</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Binge Watching */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Binge Watching</CardTitle>
                    <CardDescription>Consecutive video watching sessions</CardDescription>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <p>Tracks when you watch 5+ videos in a row</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Binge Sessions</p>
                    <p className="text-3xl font-semibold">{snapshot.behavioral.bingeWatching.totalBingeSessions}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Longest Binge</p>
                    <p className="text-3xl font-semibold">{snapshot.behavioral.bingeWatching.longestBingeVideoCount}</p>
                    <p className="text-xs text-muted-foreground">videos</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Avg Videos</p>
                    <p className="text-2xl font-semibold">{snapshot.behavioral.bingeWatching.averageBingeVideoCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Max Duration</p>
                    <p className="text-2xl font-semibold">{snapshot.behavioral.bingeWatching.longestBingeDurationMinutes}m</p>
                  </div>
                </div>

                {snapshot.behavioral.bingeWatching.top3BingeSessions && snapshot.behavioral.bingeWatching.top3BingeSessions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-base font-semibold mb-3">Top 3 Binge Sessions</h4>
                    <div className="space-y-2">
                      {snapshot.behavioral.bingeWatching.top3BingeSessions.map((binge, index) => {
                        const midpoint = new Date(binge.midpointTime * 1000)
                          .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                        return (
                          <div
                            key={index}
                            className="p-3 bg-muted rounded-lg flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium text-sm">#{index + 1} — {binge.videoCount} videos</p>
                              <p className="text-xs text-muted-foreground">
                                Duration: {binge.durationMinutes}m
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs font-medium">Midpoint</p>
                              <p className="text-xs text-muted-foreground">{midpoint}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {snapshot.behavioral.bingeWatching.totalBingeSessions === 0 && (
                  <p className="mt-4 text-sm text-muted-foreground">No binge watching sessions detected</p>
                )}
              </CardContent>
            </Card>

            {/* Search Behavior */}
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Search Behavior</CardTitle>
                    <CardDescription>How you explore Instagram</CardDescription>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <p>Shows how you search on Instagram</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Searches</p>
                      <p className="text-3xl font-semibold">{snapshot.behavioral.searchBehavior.totalSearches}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Per Day</p>
                      <p className="text-3xl font-semibold">{snapshot.behavioral.searchBehavior.averageSearchesPerDay}</p>
                    </div>
                  </div>
                  {snapshot.behavioral.searchBehavior.totalSearches > 0 && (
                    <>
                      <SearchDistributionChart 
                        profile={snapshot.behavioral.searchBehavior.searchDistribution.profile}
                        keyword={snapshot.behavioral.searchBehavior.searchDistribution.keyword}
                        place={snapshot.behavioral.searchBehavior.searchDistribution.place}
                      />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-chart-1" />
                            <span className="text-sm font-medium">Profile searches</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{snapshot.behavioral.searchBehavior.profileSearchCount}</span>
                            <Badge variant="secondary">{snapshot.behavioral.searchBehavior.searchDistribution.profile}%</Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-chart-2" />
                            <span className="text-sm font-medium">Keyword searches</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{snapshot.behavioral.searchBehavior.keywordSearchCount}</span>
                            <Badge variant="secondary">{snapshot.behavioral.searchBehavior.searchDistribution.keyword}%</Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-chart-3" />
                            <span className="text-sm font-medium">Place searches</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{snapshot.behavioral.searchBehavior.placeSearchCount}</span>
                            <Badge variant="secondary">{snapshot.behavioral.searchBehavior.searchDistribution.place}%</Badge>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <FloatingChat sessionId={userId} />
    </div>
  );
}