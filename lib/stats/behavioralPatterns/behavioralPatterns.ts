/**
 * Behavioral Patterns Calculator
 * 
 * Main entry point for analyzing user behavior patterns from Instagram data.
 * Combines activity collection, session detection, and pattern analysis.
 */

import { DataWrapper } from '../../data/dataWrapper';
import { BehavioralPatternsStats, Activity } from './types';
import { 
  collectAllActivities, 
  calculateHourlyDistribution, 
  calculateDailyDistribution,
  getTopFromDistribution 
} from './activity';
import {
  detectSessions,
  calculateSessionStats,
  detectBingeWatching,
  calculateBingeStats
} from './session';

/**
 * Calculate search behavior statistics
 */
function calculateSearchBehavior(wrapper: DataWrapper, activities: Activity[]) {
  const profileSearchCount = wrapper.getProfileSearches().length;
  const keywordSearchCount = wrapper.getKeywordSearches().length;
  const placeSearchCount = wrapper.getPlaceSearches().length;
  const totalSearches = profileSearchCount + keywordSearchCount + placeSearchCount;

  const searchActivities = activities.filter(a => 
    a.type === 'profile_search' || a.type === 'keyword_search' || a.type === 'place_search'
  );

  let averageSearchesPerDay = 0;
  if (searchActivities.length > 0) {
    const timestamps = searchActivities.map(a => a.timestamp);
    const earliestTimestamp = Math.min(...timestamps);
    const latestTimestamp = Math.max(...timestamps);
    const daysDifference = (latestTimestamp - earliestTimestamp) / (60 * 60 * 24);
    averageSearchesPerDay = daysDifference > 0 ? totalSearches / daysDifference : 0;
  }

  return {
    totalSearches,
    profileSearchCount,
    keywordSearchCount,
    placeSearchCount,
    averageSearchesPerDay: Math.round(averageSearchesPerDay * 10) / 10,
    searchDistribution: {
      profile: totalSearches > 0 ? Math.round((profileSearchCount / totalSearches) * 100) : 0,
      keyword: totalSearches > 0 ? Math.round((keywordSearchCount / totalSearches) * 100) : 0,
      place: totalSearches > 0 ? Math.round((placeSearchCount / totalSearches) * 100) : 0,
    },
  };
}

/**
 * Return empty stats when no data is available
 */
function getEmptyStats(): BehavioralPatternsStats {
  const emptyHourlyDistribution: Record<number, number> = {};
  for (let i = 0; i < 24; i++) emptyHourlyDistribution[i] = 0;

  const emptyDailyDistribution: Record<number, number> = {};
  for (let i = 0; i < 7; i++) emptyDailyDistribution[i] = 0;

  return {
    activeHours: {
      hourlyDistribution: emptyHourlyDistribution,
      mostActiveHours: [],
    },
    activeDays: {
      dailyDistribution: emptyDailyDistribution,
      mostActiveDays: [],
    },
    sessions: {
      totalSessions: 0,
      averageDurationMinutes: 0,
      longestSessionMinutes: 0,
      shortestSessionMinutes: 0,
      totalActivitiesCount: 0,
      averageActivitiesPerSession: 0,
    },
    bingeWatching: {
      totalBingeSessions: 0,
      longestBingeVideoCount: 0,
      longestBingeDurationMinutes: 0,
      averageBingeVideoCount: 0,
      bingeSessions: [],
      longestBingeMidpointTime: null,
      top3BingeSessions: [],  
    },
    searchBehavior: {
      totalSearches: 0,
      profileSearchCount: 0,
      keywordSearchCount: 0,
      placeSearchCount: 0,
      averageSearchesPerDay: 0,
      searchDistribution: {
        profile: 0,
        keyword: 0,
        place: 0,
      },
    },
  };
}

/**
 * Main function to calculate behavioral patterns
 */
export function calculateBehavioralPatterns(wrapper: DataWrapper): BehavioralPatternsStats {
  const activities = collectAllActivities(wrapper);
  
  if (activities.length === 0) {
    return getEmptyStats();
  }

  const sessions = detectSessions(activities);
  const hourlyDistribution = calculateHourlyDistribution(activities);
  const dailyDistribution = calculateDailyDistribution(activities);
  const bingeSessions = detectBingeWatching(activities);
  
  return {
    activeHours: {
      hourlyDistribution,
      mostActiveHours: getTopFromDistribution(hourlyDistribution, 3),
    },
    activeDays: {
      dailyDistribution,
      mostActiveDays: getTopFromDistribution(dailyDistribution, 3),
    },
    sessions: calculateSessionStats(sessions),
    bingeWatching: calculateBingeStats(bingeSessions),
    searchBehavior: calculateSearchBehavior(wrapper, activities),
  };
}

/**
 * Helper function to format hour (0-23) to readable string
 */
export function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
}

/**
 * Helper function to format day (0-6) to readable string
 */
export function formatDay(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day];
}

/**
 * Convert Unix timestamp to readable date/time string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toUTCString();
}