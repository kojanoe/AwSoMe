import { ParsedInstagramData } from '@/types/instagram';

/**
 * Generic statistics result
 */
export interface StatResult {
  label: string;
  value: number | string;
  percentage?: number;
  metadata?: any;
}

export interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

export interface TopItem {
  name: string;
  count: number;
  firstSeen?: Date;
  lastSeen?: Date;
  metadata?: any;
}

/**
 * Count occurrences and return top N
 */
export function getTopItems(
  items: string[],
  topN: number = 10
): TopItem[] {
  const counts = new Map<string, number>();
  
  items.forEach(item => {
    if (item) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }
  });
  
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

/**
 * Count with timestamps - returns top N with date ranges
 */
export function getTopItemsWithDates(
  items: Array<{ name: string; timestamp: number }>,
  topN: number = 10
): TopItem[] {
  const itemMap = new Map<string, { count: number; timestamps: number[] }>();
  
  items.forEach(({ name, timestamp }) => {
    if (!name) return;
    
    if (!itemMap.has(name)) {
      itemMap.set(name, { count: 0, timestamps: [] });
    }
    
    const item = itemMap.get(name)!;
    item.count++;
    if (timestamp) {
      item.timestamps.push(timestamp);
    }
  });
  
  return Array.from(itemMap.entries())
    .map(([name, data]) => {
      const sortedTimestamps = data.timestamps.sort((a, b) => a - b);
      return {
        name,
        count: data.count,
        firstSeen: sortedTimestamps[0] ? new Date(sortedTimestamps[0] * 1000) : undefined,
        lastSeen: sortedTimestamps[sortedTimestamps.length - 1] ? new Date(sortedTimestamps[sortedTimestamps.length - 1] * 1000) : undefined
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

/**
 * Calculate basic stats
 */
export function calculateBasicStats(data: ParsedInstagramData) {
  return {
    totalLikedComments: data.likedComments.length,
    totalProfileSearches: data.profileSearches.length,
    totalLinksVisited: data.linkHistory.length,
    totalFollowing: data.following.length,
    totalVideosWatched: data.videosWatched.length,
    totalPlaceSearches: data.placeSearches.length,
    totalKeywordSearches: data.keywordSearches.length,
    totalRecommendedTopics: data.recommendedTopics.length,
    totalAdsWatched: data.adsWatched.length,
    totalPostsViewed: data.postsViewed.length
  };
}

/**
 * Analyze posts viewed vs following (like your Python example!)
 */
export function analyzeFollowedVsNonFollowed(data: ParsedInstagramData) {
  // Create set of followed accounts
  const followedAccounts = new Set(
    data.following.map(f => f.author.toLowerCase())
  );
  
  // Categorize posts viewed
  const followedPosts: Array<{ name: string; timestamp: number }> = [];
  const notFollowedPosts: Array<{ name: string; timestamp: number }> = [];
  
  data.postsViewed.forEach(post => {
    const item = { name: post.author, timestamp: post.timestamp };
    
    if (followedAccounts.has(post.author.toLowerCase())) {
      followedPosts.push(item);
    } else {
      notFollowedPosts.push(item);
    }
  });
  
  const totalPosts = data.postsViewed.length;
  const followedCount = followedPosts.length;
  const notFollowedCount = notFollowedPosts.length;
  
  return {
    summary: {
      totalPosts,
      followedCount,
      notFollowedCount,
      followedPercentage: totalPosts > 0 ? (followedCount / totalPosts) * 100 : 0,
      notFollowedPercentage: totalPosts > 0 ? (notFollowedCount / totalPosts) * 100 : 0
    },
    topFollowed: getTopItemsWithDates(followedPosts, 10),
    topNotFollowed: getTopItemsWithDates(notFollowedPosts, 10)
  };
}

/**
 * Analyze most interacted accounts
 */
export function getMostInteractedAccounts(data: ParsedInstagramData, topN: number = 10) {
  const interactions = new Map<string, number>();
  
  // Count from liked comments
  data.likedComments.forEach(comment => {
    // Extract username from link if possible
    const match = comment.link.match(/instagram\.com\/([^\/]+)/);
    if (match) {
      const username = match[1];
      interactions.set(username, (interactions.get(username) || 0) + 1);
    }
  });
  
  // Count from posts viewed
  data.postsViewed.forEach(post => {
    if (post.author) {
      interactions.set(post.author, (interactions.get(post.author) || 0) + 1);
    }
  });
  
  return Array.from(interactions.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

/**
 * Analyze video watching patterns
 */
export function analyzeVideoWatching(data: ParsedInstagramData) {
  const topCreators = getTopItemsWithDates(
    data.videosWatched.map(v => ({ name: v.author, timestamp: v.timestamp })),
    10
  );
  
  // Count videos by month
  const videosByMonth = new Map<string, number>();
  data.videosWatched.forEach(video => {
    if (video.timestamp) {
      const date = new Date(video.timestamp * 1000);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      videosByMonth.set(monthKey, (videosByMonth.get(monthKey) || 0) + 1);
    }
  });
  
  return {
    totalVideos: data.videosWatched.length,
    topCreators,
    videosByMonth: Array.from(videosByMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }))
  };
}

/**
 * Analyze search behavior
 */
export function analyzeSearchBehavior(data: ParsedInstagramData) {
  return {
    topProfileSearches: getTopItems(
      data.profileSearches.map(s => s.author),
      10
    ),
    topKeywordSearches: getTopItems(
      data.keywordSearches.map(s => s.value),  
      10
    ),
    topPlaceSearches: getTopItems(
      data.placeSearches.map(s => s.value),  
      10
    ),
    totalSearches: data.profileSearches.length + data.keywordSearches.length + data.placeSearches.length
  };
}

/**
 * Get activity timeline (posts/videos/searches by day)
 */
export function getActivityTimeline(data: ParsedInstagramData) {
  const activityByDay = new Map<string, { posts: number; videos: number; searches: number }>();
  
  const addToDay = (timestamp: number, type: 'posts' | 'videos' | 'searches') => {
    if (!timestamp) return;
    
    const date = new Date(timestamp * 1000);
    const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!activityByDay.has(dayKey)) {
      activityByDay.set(dayKey, { posts: 0, videos: 0, searches: 0 });
    }
    
    activityByDay.get(dayKey)![type]++;
  };
  
  data.postsViewed.forEach(p => addToDay(p.timestamp, 'posts'));
  data.videosWatched.forEach(v => addToDay(v.timestamp, 'videos'));
  data.profileSearches.forEach(s => addToDay(s.timestamp, 'searches'));
  
  return Array.from(activityByDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, counts]) => ({ date, ...counts }));
}

/**
 * Master statistics function - returns all stats
 */
export function generateAllStatistics(data: ParsedInstagramData) {
  return {
    basic: calculateBasicStats(data),
    followedVsNonFollowed: analyzeFollowedVsNonFollowed(data),
    mostInteracted: getMostInteractedAccounts(data),
    videoWatching: analyzeVideoWatching(data),
    searchBehavior: analyzeSearchBehavior(data),
    activityTimeline: getActivityTimeline(data)
  };
}