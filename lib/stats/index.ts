import { InstagramDataStore, createDataStore } from '@/lib/data/dataStore';
import { ParsedInstagramData } from '@/types/instagram';
import { calculateBasicStats, BasicStats } from './basic';
import { analyzeFollowers, FollowerStats } from './followers';
import { analyzeEngagement, EngagementStats } from './engagement';
import { analyzeVideos, VideoStats } from './videos';
import { analyzeSearches, SearchStats } from './searches';
import { analyzeTimeline, TimelineStats } from './timeline';
import { calculateContentRatio, ContentRatioStats } from './contentRatio';

/**
 * Combined statistics result
 */
export interface Statistics {
  basic: BasicStats;
  followers: FollowerStats;
  engagement: EngagementStats;
  videos: VideoStats;
  searches: SearchStats;
  timeline: TimelineStats;
  contentRatio: ContentRatioStats;
}

/**
 * Generate specific statistics from data store
 */
export function generateStatistics(
  store: InstagramDataStore,
  modules: Array<keyof Statistics> = ['basic', 'followers', 'engagement', 'videos', 'searches', 'timeline', 'contentRatio']
): Partial<Statistics> {
  const stats: Partial<Statistics> = {};
  
  if (modules.includes('basic')) {
    stats.basic = calculateBasicStats(store);
  }
  
  if (modules.includes('followers') && store.hasPostsViewed() && store.hasFollowing()) {
    stats.followers = analyzeFollowers(store);
  }
  
  if (modules.includes('engagement') && (store.hasPostsViewed() || store.hasLikedComments())) {
    stats.engagement = analyzeEngagement(store);
  }
  
  if (modules.includes('videos') && store.hasVideosWatched()) {
    stats.videos = analyzeVideos(store);
  }
  
  if (modules.includes('searches') && store.hasSearches()) {
    stats.searches = analyzeSearches(store);
  }
  
  if (modules.includes('timeline')) {
    stats.timeline = analyzeTimeline(store);
  }

  if (modules.includes('contentRatio') && store.hasPostsViewed() && store.hasFollowing()) {
    stats.contentRatio = calculateContentRatio(store);
  }
  
  return stats;
}

/**
 * Generate all statistics
 */
export function generateAllStatistics(store: InstagramDataStore): Statistics {
  return generateStatistics(store) as Statistics;
}

/**
 * Helper: Create store from parsed data
 */
export function createStoreFromData(data: ParsedInstagramData): InstagramDataStore {
  return createDataStore(data);
}

// Re-export for convenience
export { InstagramDataStore, createDataStore };
export { calculateBasicStats } from './basic';
export { analyzeFollowers } from './followers';
export { analyzeEngagement } from './engagement';
export { analyzeVideos } from './videos';
export { analyzeSearches } from './searches';
export { analyzeTimeline } from './timeline';
export { calculateContentRatio } from './contentRatio';

// Export types explicitly to avoid conflicts
export type { BasicStats } from './basic';
export type { FollowerStats } from './followers';
export type { EngagementStats } from './engagement';
export type { VideoStats } from './videos';
export type { SearchStats } from './searches';
export type { TimelineStats } from './timeline';
export type { ContentRatioStats } from './contentRatio';