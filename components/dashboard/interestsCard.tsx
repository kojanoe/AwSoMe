/**
 * COPY TO: components/dashboard/interestsCard.tsx
 * REPLACE ENTIRE FILE
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Info } from 'lucide-react';
import { useState } from 'react';

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

const ITEMS_PER_PAGE = 24;

export function InterestsCard({ stats }: InterestsCardProps) {
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.ceil(stats.topTopics.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTopics = stats.topTopics.slice(startIndex, endIndex);

  const getTopicColor = (topic: typeof stats.topTopics[0]) => {
    if (topic.matchedInSearches && topic.matchedInProfiles) return "bg-green-500 hover:bg-green-600 text-white";
    if (topic.matchedInSearches) return "bg-blue-500 hover:bg-blue-600 text-white";
    if (topic.matchedInProfiles) return "bg-purple-500 hover:bg-purple-600 text-white";
    return "bg-muted hover:bg-muted/80 text-muted-foreground";
  };

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
              {/* Match percentage */}
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

        {/* Topics Tag Cloud Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Recommended Topics</CardTitle>
                <CardDescription>All {stats.totalTopics} topics suggested by Instagram</CardDescription>
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
                      Color-coded topics: Green = matched in both searches & profiles,
                      Blue = matched in searches, Purple = matched in profiles,
                      Gray = not matched
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Legend */}
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Both</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Searches</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted" />
                  <span>Not matched</span>
                </div>
              </div>

              {/* Tag Cloud */}
              <div className="flex flex-wrap gap-2 min-h-[200px]">
                {currentTopics.map((topic, idx) => (
                  <Badge
                    key={startIndex + idx}
                    className={`${getTopicColor(topic)} cursor-default transition-colors`}
                  >
                    {topic.topic}
                  </Badge>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Showing {startIndex + 1}-{Math.min(endIndex, stats.topTopics.length)} of {stats.topTopics.length} topics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}