import { DataWrapper } from '../data/dataWrapper';

export interface OverviewStats {
  totalPostsViewed: number;
  totalVideosWatched: number;
  totalAdsViewed: number;
  totalLikesGiven: number;
  totalCommentsLiked: number;
  dateRange: {
    earliest: Date | null;
    latest: Date | null;
  };
}

/**
 * Calculate overview statistics with deduplication
 */
export function calculateOverview(wrapper: DataWrapper): OverviewStats {
  const postsViewed = wrapper.getPostsViewed();
  const videosWatched = wrapper.getVideosWatched();
  const adsViewed = wrapper.getAdsViewed();

  // Create ads set for identification
  const adsSet = new Set<string>();
  adsViewed.forEach(ad => {
    adsSet.add(`${ad.author}:${ad.timestamp}`);
  });

  // Combine all content and deduplicate by author + timestamp
  const allContent = new Map<string, { isAd: boolean; isPost: boolean; isVideo: boolean }>();
  
  // Track posts
  postsViewed.forEach(item => {
    const key = `${item.author}:${item.timestamp}`;
    if (!allContent.has(key)) {
      allContent.set(key, { isAd: false, isPost: true, isVideo: false });
    }
  });

  // Track videos (and mark if they're ads)
  videosWatched.forEach(item => {
    const key = `${item.author}:${item.timestamp}`;
    const isAd = adsSet.has(key);
    
    if (!allContent.has(key)) {
      allContent.set(key, { isAd, isPost: false, isVideo: true });
    } else {
      // Update existing entry
      const entry = allContent.get(key)!;
      entry.isVideo = true;
      if (isAd) entry.isAd = true;
    }
  });

  // Mark ads
  adsViewed.forEach(item => {
    const key = `${item.author}:${item.timestamp}`;
    if (!allContent.has(key)) {
      allContent.set(key, { isAd: true, isPost: false, isVideo: true });
    } else {
      allContent.get(key)!.isAd = true;
    }
  });

  // Count deduplicated content
  let postsCount = 0;
  let videosCount = 0;
  let adsCount = 0;

  allContent.forEach((item) => {
    if (item.isAd) {
      adsCount++;
    }
    if (item.isPost && !item.isAd) {
      postsCount++;
    }
    if (item.isVideo && !item.isAd) {
      videosCount++;
    }
  });

  return {
    totalPostsViewed: postsCount,
    totalVideosWatched: videosCount,
    totalAdsViewed: adsCount,
    totalLikesGiven: wrapper.getLikedPosts().length,
    totalCommentsLiked: wrapper.getLikedComments().length,
    dateRange: wrapper.getDateRange(),
  };
}