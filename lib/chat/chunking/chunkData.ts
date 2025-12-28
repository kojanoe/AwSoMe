import { StatsSnapshot } from '@/types/snapshot';

export interface Chunk {
  id: string;
  category: string;
  content: string;
  metadata: {
    sessionId: string;
    priority: number; // 1-10, higher = more important
    keywords: string[];
  };
}

// Convert Snapshot into searchable text chunks
export function chunkSnapshot(snapshot: StatsSnapshot): Chunk[] {
  const chunks: Chunk[] = [];
  const { sessionId } = snapshot;

  // Overview Stats
  chunks.push({
    id: `${sessionId}-overview`,
    category: 'overview',
    content: `You viewed ${snapshot.overview.totalPostsViewed} posts, watched ${snapshot.overview.totalVideosWatched} videos, saw ${snapshot.overview.totalAdsViewed} ads, and gave ${snapshot.overview.totalLikesGiven} likes. This data covers ${snapshot.dataRange.totalDays} days from ${snapshot.dataRange.earliest} to ${snapshot.dataRange.latest}.`,
    metadata: {
      sessionId,
      priority: 9,
      keywords: ['overview', 'total', 'posts', 'videos', 'ads', 'likes', 'activity']
    }
  });

  // Content Ratio
  chunks.push({
    id: `${sessionId}-content-ratio`,
    category: 'content',
    content: `Your feed consists of ${(snapshot.contentRatio.intendedRatio * 100).toFixed(1)}% intended content (${snapshot.contentRatio.intendedContent} items), ${(snapshot.contentRatio.suggestedRatio * 100).toFixed(1)}% suggested content (${snapshot.contentRatio.suggestedContent} items), and ${(snapshot.contentRatio.adsRatio * 100).toFixed(1)}% ads (${snapshot.contentRatio.adsViewed} items). Total content viewed: ${snapshot.contentRatio.totalViewed}.`,
    metadata: {
      sessionId,
      priority: 8,
      keywords: ['content', 'ratio', 'intended', 'suggested', 'ads', 'algorithm', 'feed']
    }
  });

  // Activity Hours
  const hourNames = snapshot.behavioral.activeHours.mostActiveHours
    .map(h => `${h}:00`)
    .join(', ');
  chunks.push({
    id: `${sessionId}-active-hours`,
    category: 'time-patterns',
    content: `Your most active hours are ${hourNames}. Hour ${snapshot.insights.highlights.mostActiveHour}:00 is your peak activity time.`,
    metadata: {
      sessionId,
      priority: 7,
      keywords: ['hours', 'time', 'active', 'peak', 'when', 'schedule']
    }
  });

  // Activity Days
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const activeDayNames = snapshot.behavioral.activeDays.mostActiveDays
    .map(d => dayNames[d])
    .join(', ');
  chunks.push({
    id: `${sessionId}-active-days`,
    category: 'time-patterns',
    content: `You are most active on ${activeDayNames}. ${dayNames[snapshot.insights.highlights.mostActiveDay]} is your most active day. Your weekday vs weekend activity ratio is ${snapshot.aggregates.weekdayVsWeekendRatio.toFixed(2)}.`,
    metadata: {
      sessionId,
      priority: 7,
      keywords: ['days', 'weekday', 'weekend', 'active', 'when', 'schedule']
    }
  });

  // Session Behavior
  chunks.push({
    id: `${sessionId}-sessions`,
    category: 'sessions',
    content: `You had ${snapshot.behavioral.sessions.totalSessions} sessions (average ${snapshot.aggregates.averageSessionCount.toFixed(1)} per day). Average session length: ${snapshot.behavioral.sessions.averageDurationMinutes.toFixed(1)} minutes. Longest session: ${snapshot.behavioral.sessions.longestSessionMinutes.toFixed(1)} minutes. Average activities per session: ${snapshot.behavioral.sessions.averageActivitiesPerSession.toFixed(1)}.`,
    metadata: {
      sessionId,
      priority: 6,
      keywords: ['sessions', 'duration', 'length', 'how long', 'time spent']
    }
  });

  // Binge Watching Overview
  if (snapshot.behavioral.bingeWatching.totalBingeSessions > 0) {
    chunks.push({
      id: `${sessionId}-binge-overview`,
      category: 'binge-watching',
      content: `You had ${snapshot.behavioral.bingeWatching.totalBingeSessions} binge-watching sessions. Your longest binge contained ${snapshot.behavioral.bingeWatching.longestBingeVideoCount} videos over ${snapshot.behavioral.bingeWatching.longestBingeDurationMinutes.toFixed(1)} minutes. Average videos per binge: ${snapshot.behavioral.bingeWatching.averageBingeVideoCount.toFixed(1)}. Binge-watching risk level: ${snapshot.insights.highlights.bingeWatchingRisk}.`,
      metadata: {
        sessionId,
        priority: 8,
        keywords: ['binge', 'videos', 'consecutive', 'watching', 'risk']
      }
    });

    // Top Binge Sessions
    const top3 = snapshot.behavioral.bingeWatching.top3BingeSessions;
    if (top3.length > 0) {
      const descriptions = top3.map((s, i) => 
        `${i + 1}. ${s.videoCount} videos in ${s.durationMinutes} minutes`
      ).join('; ');
      chunks.push({
        id: `${sessionId}-top-binges`,
        category: 'binge-watching',
        content: `Your top 3 binge sessions: ${descriptions}.`,
        metadata: {
          sessionId,
          priority: 5,
          keywords: ['binge', 'top', 'longest', 'videos']
        }
      });
    }
  } else {
    chunks.push({
      id: `${sessionId}-no-binge`,
      category: 'binge-watching',
      content: `You did not have any binge-watching sessions during this period.`,
      metadata: {
        sessionId,
        priority: 4,
        keywords: ['binge', 'no binge', 'watching']
      }
    });
  }

  // Search Behavior Overview
  chunks.push({
    id: `${sessionId}-search-overview`,
    category: 'search',
    content: `You performed ${snapshot.behavioral.searchBehavior.totalSearches} searches (${snapshot.behavioral.searchBehavior.averageSearchesPerDay.toFixed(1)} per day): ${snapshot.behavioral.searchBehavior.profileSearchCount} profile searches, ${snapshot.behavioral.searchBehavior.keywordSearchCount} keyword searches, and ${snapshot.behavioral.searchBehavior.placeSearchCount} place searches.`,
    metadata: {
      sessionId,
      priority: 6,
      keywords: ['search', 'searches', 'profile', 'keyword', 'place']
    }
  });

  // Search Distribution
  chunks.push({
    id: `${sessionId}-search-distribution`,
    category: 'search',
    content: `Your search distribution: ${snapshot.behavioral.searchBehavior.searchDistribution.profile}% profiles, ${snapshot.behavioral.searchBehavior.searchDistribution.keyword}% keywords, ${snapshot.behavioral.searchBehavior.searchDistribution.place}% places.`,
    metadata: {
      sessionId,
      priority: 5,
      keywords: ['search', 'distribution', 'types', 'profile', 'keyword', 'place']
    }
  });

  // Engagement - Suggested Content
  chunks.push({
    id: `${sessionId}-suggested-engagement`,
    category: 'engagement',
    content: `You viewed ${snapshot.engagement.suggestedEngagement.totalViewed} suggested posts and liked ${snapshot.engagement.suggestedEngagement.totalLiked} of them. Engagement rate: ${snapshot.engagement.suggestedEngagement.engagementRate.toFixed(1)}%.`,
    metadata: {
      sessionId,
      priority: 7,
      keywords: ['engagement', 'suggested', 'likes', 'algorithm', 'interaction']
    }
  });

  // Engagement - Ads
  chunks.push({
    id: `${sessionId}-ads-engagement`,
    category: 'engagement',
    content: `You saw ${snapshot.engagement.adsEngagement.totalViewed} ads and liked ${snapshot.engagement.adsEngagement.totalLiked} of them. Ad engagement rate: ${snapshot.engagement.adsEngagement.engagementRate.toFixed(1)}%.`,
    metadata: {
      sessionId,
      priority: 6,
      keywords: ['engagement', 'ads', 'advertising', 'likes', 'interaction']
    }
  });

  // Overall Engagement
  chunks.push({
    id: `${sessionId}-overall-engagement`,
    category: 'engagement',
    content: `Your overall engagement rate is ${snapshot.aggregates.overallEngagementRate.toFixed(1)}% (total likes divided by total content viewed). You give likes at a frequency of ${snapshot.aggregates.likeFrequency.toFixed(1)} per day. Engagement level: ${snapshot.insights.highlights.engagementLevel}.`,
    metadata: {
      sessionId,
      priority: 7,
      keywords: ['engagement', 'likes', 'interaction', 'rate', 'frequency']
    }
  });

  // Daily Averages
  chunks.push({
    id: `${sessionId}-daily-averages`,
    category: 'patterns',
    content: `Daily averages: ${snapshot.aggregates.dailyAverageContent.toFixed(0)} pieces of content viewed, ${snapshot.aggregates.averageSessionCount.toFixed(1)} sessions, ${snapshot.aggregates.likeFrequency.toFixed(1)} likes.`,
    metadata: {
      sessionId,
      priority: 6,
      keywords: ['daily', 'average', 'per day', 'typical']
    }
  });

  // Content Source Dominance
  chunks.push({
    id: `${sessionId}-content-dominance`,
    category: 'insights',
    content: `Your dominant content source is ${snapshot.insights.highlights.dominantContentSource} content. Content breakdown: ${snapshot.aggregates.contentSources.intended}% intended, ${snapshot.aggregates.contentSources.suggested}% suggested, ${snapshot.aggregates.contentSources.ads}% ads.`,
    metadata: {
      sessionId,
      priority: 8,
      keywords: ['dominant', 'content', 'source', 'algorithm', 'feed']
    }
  });

  // Key Insights Summary
  chunks.push({
    id: `${sessionId}-highlights`,
    category: 'insights',
    content: `Key insights: Most active at ${snapshot.insights.highlights.mostActiveHour}:00 on ${dayNames[snapshot.insights.highlights.mostActiveDay]}s. Dominant content: ${snapshot.insights.highlights.dominantContentSource}. Engagement level: ${snapshot.insights.highlights.engagementLevel}. Binge-watching risk: ${snapshot.insights.highlights.bingeWatchingRisk}.`,
    metadata: {
      sessionId,
      priority: 10,
      keywords: ['summary', 'insights', 'highlights', 'key', 'overview']
    }
  });

  return chunks;
}