import { InstagramDataStore } from '@/lib/data/dataStore';

export interface BasicStats {
  totalLikedComments: number;
  totalProfileSearches: number;
  totalLinksVisited: number;
  totalFollowing: number;
  totalVideosWatched: number;
  totalPlaceSearches: number;
  totalKeywordSearches: number;
  totalRecommendedTopics: number;
  totalAdsWatched: number;
  totalPostsViewed: number;
  dateRange: {
    earliest: Date | null;
    latest: Date | null;
  };
}

export function calculateBasicStats(store: InstagramDataStore): BasicStats {
  const data = store.getAllData();
  
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
    totalPostsViewed: data.postsViewed.length,
    dateRange: store.getDateRange()
  };
}