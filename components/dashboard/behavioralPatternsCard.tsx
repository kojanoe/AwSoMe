/**
 * Behavioral Patterns Card
 * Displays user behavior analysis with charts and statistics
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BehavioralPatternsStats } from '@/lib/stats/behavioralPatterns';
import { ActiveHoursChart } from '@/components/charts/activeHours';
import { ActiveDaysChart } from '@/components/charts/activeDays';
import { SearchDistributionChart } from '@/components/charts/searchDistribution';
import { Info } from 'lucide-react';

interface BehavioralPatternsCardProps {
  stats: BehavioralPatternsStats;
}

export function BehavioralPatternsCard({ stats }: BehavioralPatternsCardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Behavioral Patterns</h2>
        <p className="text-sm text-muted-foreground">
          Your Instagram usage patterns and habits
        </p>
      </div>

      {/* Activity Time Patterns */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Hours */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Most Active Hours</CardTitle>
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
                    <p>Shows your activity distribution across 24 hours. Peak hours indicate when you&apos;re most active on Instagram.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <ActiveHoursChart data={stats.activeHours.hourlyDistribution} />
          </CardContent>
        </Card>

        {/* Active Days */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Most Active Days</CardTitle>
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
                    <p>Shows your activity throughout the week. Higher bars indicate days when you use Instagram more frequently.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <ActiveDaysChart data={stats.activeDays.dailyDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Binge Watching & Search Behavior */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Binge Watching */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Binge Watching</CardTitle>
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
                    <p>Tracks when you watch 5 or more videos in a row without taking long breaks (2+ minutes).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Binge Sessions</p>
                <p className="text-3xl font-semibold">{stats.bingeWatching.totalBingeSessions}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Longest Binge</p>
                <p className="text-3xl font-semibold">{stats.bingeWatching.longestBingeVideoCount}</p>
                <p className="text-xs text-muted-foreground">videos</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg Videos</p>
                <p className="text-2xl font-semibold">{stats.bingeWatching.averageBingeVideoCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Max Duration</p>
                <p className="text-2xl font-semibold">{stats.bingeWatching.longestBingeDurationMinutes}m</p>
              </div>
            </div>
            {stats.bingeWatching.top3BingeSessions && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-3">Top 3 Binge Sessions</h4>

                <div className="space-y-3">
                  {stats.bingeWatching.top3BingeSessions.map((binge, index) => {
                    const midpoint = new Date(binge.midpointTime * 1000)
                      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div
                        key={index}
                        className="p-3 bg-muted rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">#{index + 1} — {binge.videoCount} videos</p>
                          <p className="text-sm text-muted-foreground">
                            Duration: {binge.durationMinutes}m
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{midpoint}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            
            {stats.bingeWatching.totalBingeSessions === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">No binge watching sessions detected</p>
            )}
          </CardContent>
        </Card>

        {/* Search Behavior */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Search Behavior</CardTitle>
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
                    <p>Shows how you search on Instagram: profiles (accounts), keywords (topics), or places (locations).</p>
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
                  <p className="text-3xl font-semibold">{stats.searchBehavior.totalSearches}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Per Day</p>
                  <p className="text-3xl font-semibold">{stats.searchBehavior.averageSearchesPerDay}</p>
                </div>
              </div>
              {stats.searchBehavior.totalSearches > 0 && (
                <>
                  <SearchDistributionChart 
                    profile={stats.searchBehavior.searchDistribution.profile}
                    keyword={stats.searchBehavior.searchDistribution.keyword}
                    place={stats.searchBehavior.searchDistribution.place}
                  />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-chart-1" />
                        <span className="text-sm font-medium">Profile searches</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{stats.searchBehavior.profileSearchCount}</span>
                        <Badge variant="secondary">{stats.searchBehavior.searchDistribution.profile}%</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-chart-2" />
                        <span className="text-sm font-medium">Keyword searches</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{stats.searchBehavior.keywordSearchCount}</span>
                        <Badge variant="secondary">{stats.searchBehavior.searchDistribution.keyword}%</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-chart-3" />
                        <span className="text-sm font-medium">Place searches</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{stats.searchBehavior.placeSearchCount}</span>
                        <Badge variant="secondary">{stats.searchBehavior.searchDistribution.place}%</Badge>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}