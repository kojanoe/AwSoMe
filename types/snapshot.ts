import { OverviewStats } from '@/lib/stats/overview';
import { ContentRatioStats } from '@/lib/stats/contentRatio';
import { EngagementRatioStats } from '@/lib/stats/engagementRatio';
import { BehavioralPatternsStats } from '@/lib/stats/behavioralPatterns';
import { HourlyContentBreakdown, DailyContentBreakdown } from '@/lib/stats/timeBasedContent';

export interface StatsSnapshot {
  sessionId: string;
  generatedAt: number;
  version: string;
  
  dataRange: {
    earliest: string | null;
    latest: string | null;
    totalDays: number;
  };
  
  overview: OverviewStats;
  contentRatio: ContentRatioStats;
  engagement: EngagementRatioStats;
  behavioral: BehavioralPatternsStats;
  
  timeBasedContent: {
    hourly: HourlyContentBreakdown[];
    daily: DailyContentBreakdown[];
  };
  
  insights: {   
    highlights: {
      mostActiveHour: number;
      mostActiveDay: number;
      dominantContentSource: 'intended' | 'suggested' | 'ads';
      engagementLevel: 'low' | 'medium' | 'high';
      bingeWatchingRisk: 'low' | 'medium' | 'high';
      peakIntendedHour: number;
      peakSuggestedHour: number;
      peakIntendedDay: number;
      peakSuggestedDay: number;
    };
  };
  
  aggregates: {
    peakActivityHours: number[];
    peakActivityDays: number[];
    totalContentViewed: number;
    dailyAverageContent: number;
    weekdayVsWeekendRatio: number;
    overallEngagementRate: number;
    likeFrequency: number;
    averageSessionCount: number;
    typicalSessionLength: number;
    contentSources: {
      intended: number;
      suggested: number;
      ads: number;
    };
  };
}