/**
 * Type definitions for behavioral patterns analysis
 */

export const SESSION_GAP_SECONDS = 120; // 2 minutes
export const BINGE_MIN_VIDEOS = 5; // Minimum videos to count as binge watching

export interface Activity {
  type: 'post_viewed' | 'video_watched' | 'ad_viewed' | 'liked_post' | 'liked_comment' | 'profile_search' | 'keyword_search' | 'place_search';
  timestamp: number;
  author?: string;
  value?: string;
}

export interface Session {
  startTime: number;
  endTime: number;
  durationSeconds: number;
  activityCount: number;
  activities: Activity[];
}

export interface BingeSession {
  startTime: number;
  endTime: number;
  videoCount: number;
  durationMinutes: number;
}

export interface BehavioralPatternsStats {
  activeHours: {
    hourlyDistribution: Record<number, number>;
    mostActiveHours: number[];
  };
  activeDays: {
    dailyDistribution: Record<number, number>;
    mostActiveDays: number[];
  };
  sessions: {
    totalSessions: number;
    averageDurationMinutes: number;
    longestSessionMinutes: number;
    shortestSessionMinutes: number;
    totalActivitiesCount: number;
    averageActivitiesPerSession: number;
  };
  bingeWatching: {
    totalBingeSessions: number;
    longestBingeVideoCount: number;
    longestBingeDurationMinutes: number;
    averageBingeVideoCount: number;
    bingeSessions: BingeSession[];
  };
  searchBehavior: {
    totalSearches: number;
    profileSearchCount: number;
    keywordSearchCount: number;
    placeSearchCount: number;
    averageSearchesPerDay: number;
    searchDistribution: {
      profile: number;
      keyword: number;
      place: number;
    };
  };
}