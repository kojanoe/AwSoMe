/**
 * Overview Statistics
 * 
 * Basic numbers showing overall Instagram activity.
 * These are simple counts with no complex analysis.
 */

import { InstagramDataStore } from '../data/dataStore';

export interface OverviewStats {
  totalPostsViewed: number;
  totalVideosWatched: number;
  totalAdsWatched: number;
  totalLikesGiven: number;
  totalCommentsLiked: number;
  dateRange: {
    earliest: Date | null;
    latest: Date | null;
  };
}

/**
 * Calculate overview statistics
 */
export function calculateOverview(store: InstagramDataStore): OverviewStats {
  return {
    totalPostsViewed: store.getPostsViewed().length,
    totalVideosWatched: store.getVideosWatched().length,
    totalAdsWatched: store.getAdsWatched().length,
    totalLikesGiven: store.getLikedPosts().length,
    totalCommentsLiked: store.getLikedComments().length,
    dateRange: store.getDateRange(),
  };
}