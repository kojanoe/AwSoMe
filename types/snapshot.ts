/**
 * Stats Snapshot Type Definition
 */

import { OverviewStats } from '@/lib/stats/overview';
import { ContentRatioStats } from '@/lib/stats/contentRatio';
import { EngagementRatioStats } from '@/lib/stats/engagementRatio';
import { BehavioralPatternsStats } from '@/lib/stats/behavioralPatterns';

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

export interface StatsSnapshot {
  // Metadata
  sessionId: string;
  generatedAt: number; // Unix timestamp
  version: string; // For future compatibility (e.g., "1.0.0")
  
  // Date range of the data
  dataRange: {
    earliest: string | null; // ISO date string
    latest: string | null;   // ISO date string
    totalDays: number;
  };
  
  // All calculated statistics
  overview: OverviewStats;
  contentRatio: ContentRatioStats;
  engagement: EngagementRatioStats;
  behavioral: BehavioralPatternsStats;
  topics: TopicsStats;
  
  // Insights - key findings from the data
  insights: {   
    // Notable statistics
    highlights: {
      mostActiveHour: number;      // 0-23
      mostActiveDay: number;        // 0-6 (Sunday-Saturday)
      dominantContentSource: 'intended' | 'suggested' | 'ads';
      engagementLevel: 'low' | 'medium' | 'high';
      bingeWatchingRisk: 'low' | 'medium' | 'high';
    };
  };
  
  // Aggregated safe data (no PII - no usernames, links, etc.)
  aggregates: {
    // Time patterns
    peakActivityHours: number[]; // Top 3 hours
    peakActivityDays: number[];  // Top 3 days
    
    // Content consumption
    totalContentViewed: number;
    dailyAverageContent: number;
    weekdayVsWeekendRatio: number; // weekday / weekend activity ratio
    
    // Engagement metrics
    overallEngagementRate: number; // Total likes / Total viewed
    likeFrequency: number;         // Likes per day
    
    // Session patterns
    averageSessionCount: number;   // Sessions per day
    typicalSessionLength: number;  // Minutes
    
    // Content source breakdown (percentages)
    contentSources: {
      intended: number;
      suggested: number;
      ads: number;
    };
  };
}