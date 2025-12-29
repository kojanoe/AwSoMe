/**
 * Interests Section Card
 * Shows Instagram's recommended topics and how they match user behavior
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
import { Info, Check, X } from 'lucide-react';

export interface TopicsStats {
  totalTopics: number;
  topTopics: Array<{
    topic: string;
    matchedInSearches: boolean;
    matchedInProfiles: boolean;
  }>;
  matchAnalysis: {
    totalTopics: number;
    matchedViaKeywords: number;
    matchedViaProfiles: number;
    totalMatched: number;
    matchPercentage: number;
  };
  unmatchedTopics: string[];
}

interface InterestsCardProps {
  stats: TopicsStats;
}

export function InterestsCard({ stats }: InterestsCardProps) {
  if (stats.totalTopics === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your Interests</CardTitle>
          <CardDescription>Instagram's recommended topics for you</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No topic data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Your Interests</h2>
        <p className="text-sm text-muted-foreground">
          Topics Instagram thinks you're interested in
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Match Analysis Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Topic Match Analysis</CardTitle>
                <CardDescription>
                  How Instagram's suggestions align with your searches
                </CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>
                      Compares Instagram's recommended topics against your actual search
                      behavior (keywords and profiles you searched for).
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Match percentage - large display */}
              <div className="text-center">
                <div className="text-5xl font-bold text-primary">
                  {stats.matchAnalysis.matchPercentage}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  of suggested topics match your searches
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Total Topics</span>
                  <Badge variant="secondary">{stats.matchAnalysis.totalTopics}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Matched via Keywords</span>
                  <Badge variant="secondary">{stats.matchAnalysis.matchedViaKeywords}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Matched via Profiles</span>
                  <Badge variant="secondary">{stats.matchAnalysis.matchedViaProfiles}</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">
                    Total Matched
                  </span>
                  <Badge className="bg-green-600 hover:bg-green-700">
                    {stats.matchAnalysis.totalMatched}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topics List Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Recommended Topics</CardTitle>
                <CardDescription>Top topics suggested by Instagram</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>
                      Green checkmark means you searched for this topic. Red X means
                      Instagram suggested it but you never searched for it.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {stats.topTopics.map((topic, index) => {
                const isMatched = topic.matchedInSearches || topic.matchedInProfiles;
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Match indicator */}
                      <div
                        className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full ${
                          isMatched
                            ? 'bg-green-100 dark:bg-green-900'
                            : 'bg-red-100 dark:bg-red-900'
                        }`}
                      >
                        {isMatched ? (
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>

                      {/* Topic name */}
                      <span className="font-medium text-sm truncate">{topic.topic}</span>
                    </div>

                    {/* Match badges */}
                    <div className="flex gap-1 flex-shrink-0">
                      {topic.matchedInSearches && (
                        <Badge variant="outline" className="text-xs">
                          Keyword
                        </Badge>
                      )}
                      {topic.matchedInProfiles && (
                        <Badge variant="outline" className="text-xs">
                          Profile
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}