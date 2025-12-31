import { StatsSnapshot } from '@/types/snapshot';

export interface Chunk {
  id: string;
  category: string;
  content: string;
  metadata: {
    sessionId: string;
    priority: number;
    keywords: string[];
  };
}

export function chunkSnapshot(snapshot: StatsSnapshot): Chunk[] {
  const chunks: Chunk[] = [];
  const { sessionId } = snapshot;
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

  // Time-based content patterns - Hourly
  chunks.push({
    id: `${sessionId}-time-content-hourly`,
    category: 'time-patterns',
    content: `Your content consumption varies throughout the day. At ${snapshot.insights.highlights.peakIntendedHour}:00 you see the most intended content, while ${snapshot.insights.highlights.peakSuggestedHour}:00 is when you see the most suggested content. This shows when you're actively seeking content vs when the algorithm shows you more recommendations.`,
    metadata: {
      sessionId,
      priority: 8,
      keywords: ['time', 'hours', 'content', 'intended', 'suggested', 'algorithm', 'pattern']
    }
  });

  // Time-based content patterns - Daily
  chunks.push({
    id: `${sessionId}-time-content-daily`,
    category: 'time-patterns',
    content: `Your content consumption patterns differ by day of the week. On ${dayNames[snapshot.insights.highlights.peakIntendedDay]}s you see more intended content, while ${dayNames[snapshot.insights.highlights.peakSuggestedDay]}s you see more suggested content. This reveals how your Instagram usage shifts between weekdays and weekends.`,
    metadata: {
      sessionId,
      priority: 8,
      keywords: ['days', 'weekday', 'weekend', 'content', 'intended', 'suggested', 'algorithm', 'pattern']
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

  // Topics and Match Analysis
  if (snapshot.topics.totalTopics > 0) {
    chunks.push({
      id: `${sessionId}-topics-overview`,
      category: 'interests',
      content: `Instagram recommended ${snapshot.topics.totalTopics} topics for you. ${snapshot.topics.matchAnalysis.matchPercentage}% of these topics (${snapshot.topics.matchAnalysis.totalMatched} topics) match your actual search behavior. ${snapshot.topics.matchAnalysis.matchedViaKeywords} topics matched your keyword searches, and ${snapshot.topics.matchAnalysis.matchedViaProfiles} matched profiles you searched for.`,
      metadata: {
        sessionId,
        priority: 7,
        keywords: ['topics', 'interests', 'recommended', 'algorithm', 'suggestions', 'match']
      }
    });

    const matchedTopics = snapshot.topics.topTopics
      .filter(t => t.matchedInSearches || t.matchedInProfiles)
      .slice(0, 5)
      .map(t => t.topic)
      .join(', ');
    
    if (matchedTopics) {
      chunks.push({
        id: `${sessionId}-matched-topics`,
        category: 'interests',
        content: `Topics that match your behavior: ${matchedTopics}. These topics align with your searches.`,
        metadata: {
          sessionId,
          priority: 6,
          keywords: ['topics', 'matched', 'interests', 'accurate', 'aligned']
        }
      });
    }

    if (snapshot.topics.unmatchedTopics.length > 0) {
      const unmatchedList = snapshot.topics.unmatchedTopics.slice(0, 5).join(', ');
      const remaining = snapshot.topics.unmatchedTopics.length > 5 
        ? ` (and ${snapshot.topics.unmatchedTopics.length - 5} more)` 
        : '';
      chunks.push({
        id: `${sessionId}-unmatched-topics`,
        category: 'interests',
        content: `Topics Instagram suggested but you never searched for: ${unmatchedList}${remaining}. These topics don't match your search behavior.`,
        metadata: {
          sessionId,
          priority: 6,
          keywords: ['topics', 'unmatched', 'algorithm', 'inaccurate', 'suggestions', 'mismatch']
        }
      });
    }

    const allTopicsList = snapshot.topics.topTopics
      .map(t => t.topic)
      .join(', ');
    chunks.push({
      id: `${sessionId}-all-topics`,
      category: 'interests',
      content: `Full list of recommended topics: ${allTopicsList}.`,
      metadata: {
        sessionId,
        priority: 5,
        keywords: ['topics', 'interests', 'list', 'all']
      }
    });
  } else {
    chunks.push({
      id: `${sessionId}-no-topics`,
      category: 'interests',
      content: `No topic recommendations were found in your Instagram data.`,
      metadata: {
        sessionId,
        priority: 3,
        keywords: ['topics', 'interests', 'none']
      }
    });
  }

  // Key Insights Summary
  chunks.push({
    id: `${sessionId}-highlights`,
    category: 'insights',
    content: `Key insights: Most active at ${snapshot.insights.highlights.mostActiveHour}:00 on ${dayNames[snapshot.insights.highlights.mostActiveDay]}s. Dominant content: ${snapshot.insights.highlights.dominantContentSource}. Engagement level: ${snapshot.insights.highlights.engagementLevel}. Binge-watching risk: ${snapshot.insights.highlights.bingeWatchingRisk}. Peak intended content at ${snapshot.insights.highlights.peakIntendedHour}:00, peak suggested content at ${snapshot.insights.highlights.peakSuggestedHour}:00.`,
    metadata: {
      sessionId,
      priority: 10,
      keywords: ['summary', 'insights', 'highlights', 'key', 'overview']
    }
  });

  return chunks;
}