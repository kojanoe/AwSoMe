import { DataWrapper } from '../data/dataWrapper';
import { StatsSnapshot } from '@/types/snapshot';
import { calculateOverview } from './overview';
import { calculateContentRatio } from './contentRatio';
import { calculateEngagementRatio } from './engagementRatio';
import { calculateBehavioralPatterns } from './behavioralPatterns';
import { calculateHourlyContentBreakdown, calculateDailyContentBreakdown } from './timeBasedContent';

export function generateStatsSnapshot(
  wrapper: DataWrapper,
  sessionId: string
): StatsSnapshot {
  const overview = calculateOverview(wrapper);
  const contentRatio = calculateContentRatio(wrapper);
  const engagement = calculateEngagementRatio(wrapper);
  const behavioral = calculateBehavioralPatterns(wrapper);
  
  const hourlyBreakdown = calculateHourlyContentBreakdown(wrapper);
  const dailyBreakdown = calculateDailyContentBreakdown(wrapper);

  const contentPercentages = {
    intended: Math.round(contentRatio.intendedRatio * 100),
    suggested: Math.round(contentRatio.suggestedRatio * 100),
    ads: Math.round(contentRatio.adsRatio * 100),
  };

  const suggestedEngagementPercent = Math.round(engagement.suggestedEngagement.engagementRate * 100);

  const totalDays = calculateTotalDays(overview.dateRange.earliest, overview.dateRange.latest);
  const totalContentViewed = contentRatio.totalViewed;
  const weekdayVsWeekendRatio = calculateWeekdayWeekendRatio(behavioral.activeDays.dailyDistribution);
  const overallEngagementRate = totalContentViewed > 0
    ? overview.totalLikesGiven / totalContentViewed
    : 0;

  const peakIntendedHour = findPeakHour(hourlyBreakdown, 'intended');
  const peakSuggestedHour = findPeakHour(hourlyBreakdown, 'suggested');
  const peakIntendedDay = findPeakDay(dailyBreakdown, 'intended');
  const peakSuggestedDay = findPeakDay(dailyBreakdown, 'suggested');

  return {
    sessionId,
    generatedAt: Date.now(),
    version: '1.0.0',
    dataRange: {
      earliest: overview.dateRange.earliest?.toISOString() || null,
      latest: overview.dateRange.latest?.toISOString() || null,
      totalDays,
    },
    overview,
    contentRatio,
    engagement,
    behavioral,
    timeBasedContent: {
      hourly: hourlyBreakdown,
      daily: dailyBreakdown,
    },
    insights: {
      highlights: {
        mostActiveHour: behavioral.activeHours.mostActiveHours[0] || 0,
        mostActiveDay: behavioral.activeDays.mostActiveDays[0] || 0,
        dominantContentSource: getDominantContentSource(contentPercentages),
        engagementLevel: getEngagementLevel(suggestedEngagementPercent),
        bingeWatchingRisk: getBingeWatchingRisk(behavioral.bingeWatching),
        peakIntendedHour,
        peakSuggestedHour,
        peakIntendedDay,
        peakSuggestedDay,
      },
    },
    aggregates: {
      peakActivityHours: behavioral.activeHours.mostActiveHours.slice(0, 3),
      peakActivityDays: behavioral.activeDays.mostActiveDays.slice(0, 3),
      totalContentViewed,
      dailyAverageContent: totalDays > 0 ? Math.round(totalContentViewed / totalDays) : 0,
      weekdayVsWeekendRatio: Math.round(weekdayVsWeekendRatio * 100) / 100,
      overallEngagementRate: Math.round(overallEngagementRate * 1000) / 10,
      likeFrequency: totalDays > 0 ? Math.round((overview.totalLikesGiven / totalDays) * 10) / 10 : 0,
      averageSessionCount: totalDays > 0
        ? Math.round((behavioral.sessions.totalSessions / totalDays) * 10) / 10
        : 0,
      typicalSessionLength: Math.round(behavioral.sessions.averageDurationMinutes),
      contentSources: {
        intended: contentPercentages.intended,
        suggested: contentPercentages.suggested,
        ads: contentPercentages.ads,
      },
    },
  };
}

function calculateTotalDays(earliest: Date | null, latest: Date | null): number {
  if (!earliest || !latest) return 0;
  const diffMs = latest.getTime() - earliest.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function getDominantContentSource(
  contentPercentages: { intended: number; suggested: number; ads: number }
): 'intended' | 'suggested' | 'ads' {
  const { intended, suggested, ads } = contentPercentages;
  if (intended > suggested && intended > ads) return 'intended';
  if (suggested > ads) return 'suggested';
  return 'ads';
}

function getEngagementLevel(suggestedEngagement: number): 'low' | 'medium' | 'high' {
  if (suggestedEngagement < 3) return 'low';
  if (suggestedEngagement < 10) return 'medium';
  return 'high';
}

function getBingeWatchingRisk(bingeWatching: any): 'low' | 'medium' | 'high' {
  const sessions = bingeWatching.totalBingeSessions;
  const avgVideos = bingeWatching.averageBingeVideoCount;
  
  if (sessions === 0) return 'low';
  if (sessions < 5 || avgVideos < 8) return 'medium';
  return 'high';
}

function calculateWeekdayWeekendRatio(dailyDistribution: Record<number, number>): number {
  const weekdayActivity = [1, 2, 3, 4, 5].reduce(
    (sum, day) => sum + (dailyDistribution[day] || 0),
    0
  );
  
  const weekendActivity = [0, 6].reduce(
    (sum, day) => sum + (dailyDistribution[day] || 0),
    0
  );

  if (weekendActivity === 0) return 0;
  return weekdayActivity / weekendActivity;
}

function findPeakHour(
  breakdown: any[],
  type: 'intended' | 'suggested' | 'ads'
): number {
  const key = type === 'intended' ? 'intentedPercent' : type === 'suggested' ? 'suggestedPercent' : 'adsPercent';
  let maxPercent = 0;
  let peakHour = 0;
  breakdown.forEach(item => {
    if (item[key] > maxPercent) {
      maxPercent = item[key];
      peakHour = item.hour;
    }
  });
  return peakHour;
}

function findPeakDay(
  breakdown: any[],
  type: 'intended' | 'suggested' | 'ads'
): number {
  const key = type === 'intended' ? 'intentedPercent' : type === 'suggested' ? 'suggestedPercent' : 'adsPercent';
  let maxPercent = 0;
  let peakDay = 0;
  breakdown.forEach(item => {
    if (item[key] > maxPercent) {
      maxPercent = item[key];
      peakDay = item.day;
    }
  });
  return peakDay;
}