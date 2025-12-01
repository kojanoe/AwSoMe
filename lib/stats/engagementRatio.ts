/**
 * Engagement Ratio Calculator
 * 
 * This calculator measures how often users engage (like) with suggested content
 * and ads after viewing them, compared to content they intentionally sought out.
 * 
 * DEFINITIONS:
 * 
 * 1. SUGGESTED CONTENT
 *    Posts/videos from accounts NOT in:
 *    - Accounts you follow (following)
 *    - Accounts you searched for (profile_searches)
 * 
 * 2. ADS
 *    Content from ads_watched
 * 
 * 3. ENGAGEMENT
 *    A "like" is counted as engagement if:
 *    - The liked post author matches a viewed post/video/ad author
 *    - The like happened within 5 minutes AFTER viewing
 *    - This indicates the user liked the content after seeing it
 * 
 * FORMULA:
 * --------
 * Suggested Engagement Rate = Liked Suggested / Total Suggested Viewed
 * Ads Engagement Rate = Liked Ads / Total Ads Viewed
 * 
 * TIME WINDOW:
 * ------------
 * 5 minutes (300 seconds) - Short window because we can't match exact posts,
 * only authors. A tight window reduces false positives.
 */

import { InstagramDataStore } from '../data/dataStore';
import { Following, ProfileSearch, LikedPost } from '@/types/instagram';

const TIME_WINDOW_SECONDS = 300; // 5 minutes

export interface EngagementRatioStats {
  suggestedEngagement: {
    totalViewed: number;
    totalLiked: number;
    engagementRate: number;
  };
  adsEngagement: {
    totalViewed: number;
    totalLiked: number;
    engagementRate: number;
  };
  timeWindow: number; // in seconds
}

/**
 * Calculate engagement rates for suggested content and ads
 */
export function calculateEngagementRatio(store: InstagramDataStore): EngagementRatioStats {
  const following = store.getFollowing();
  const profileSearches = store.getProfileSearches();
  const postsViewed = store.getPostsViewed();
  const videosWatched = store.getVideosWatched();
  const adsWatched = store.getAdsWatched();
  const likedPosts = store.getLikedPosts();

  // Create set of intended authors (following + searched)
  const intendedAuthors = new Set<string>();
  following.forEach((f: Following) => intendedAuthors.add(f.author));
  profileSearches.forEach((s: ProfileSearch) => intendedAuthors.add(s.author));

  // Create a Set of ads for quick lookup (author + timestamp)
  const adsSet = new Set<string>();
  const adsList: Array<{ author: string; timestamp: number }> = [];
  adsWatched.forEach(ad => {
    const key = `${ad.author}:${ad.timestamp}`;
    adsSet.add(key);
    adsList.push({ author: ad.author, timestamp: ad.timestamp });
  });

  // Combine all content and deduplicate
  const allContent = new Map<string, { author: string; timestamp: number; isAd: boolean }>();
  
  [...postsViewed, ...videosWatched, ...adsWatched].forEach(item => {
    const key = `${item.author}:${item.timestamp}`;
    if (!allContent.has(key)) {
      allContent.set(key, { 
        author: item.author, 
        timestamp: item.timestamp,
        isAd: adsSet.has(key)
      });
    }
  });

  // Filter for suggested content only (not ads, not intended)
  const suggestedViewed = Array.from(allContent.values()).filter(
    item => !item.isAd && !intendedAuthors.has(item.author)
  );

  // Count likes on suggested content (within time window after viewing)
  let suggestedLikedCount = 0;

  likedPosts.forEach((like: LikedPost) => {
    // Skip if this is an intended author
    if (intendedAuthors.has(like.author)) {
      return;
    }

    // Check if this was in ads (ads take priority)
    const wasAd = adsList.some(ad =>
      ad.author === like.author &&
      ad.timestamp < like.timestamp &&
      (like.timestamp - ad.timestamp) <= TIME_WINDOW_SECONDS
    );

    if (wasAd) {
      return; // Don't count as suggested if it was an ad
    }

    // Find if this author was viewed recently before liking
    const wasViewedRecently = suggestedViewed.some(view => 
      view.author === like.author &&
      view.timestamp < like.timestamp &&
      (like.timestamp - view.timestamp) <= TIME_WINDOW_SECONDS
    );

    if (wasViewedRecently) {
      suggestedLikedCount++;
    }
  });

  // Count likes on ads (within time window after viewing)
  let adsLikedCount = 0;

  likedPosts.forEach((like: LikedPost) => {
    // Find if this author appeared in ads recently before liking
    const wasAdRecently = adsList.some(ad =>
      ad.author === like.author &&
      ad.timestamp < like.timestamp &&
      (like.timestamp - ad.timestamp) <= TIME_WINDOW_SECONDS
    );

    if (wasAdRecently) {
      adsLikedCount++;
    }
  });

  // Calculate engagement rates
  const suggestedEngagementRate = suggestedViewed.length > 0
    ? suggestedLikedCount / suggestedViewed.length
    : 0;

  const adsEngagementRate = adsList.length > 0
    ? adsLikedCount / adsList.length
    : 0;

  return {
    suggestedEngagement: {
      totalViewed: suggestedViewed.length,
      totalLiked: suggestedLikedCount,
      engagementRate: suggestedEngagementRate,
    },
    adsEngagement: {
      totalViewed: adsList.length,
      totalLiked: adsLikedCount,
      engagementRate: adsEngagementRate,
    },
    timeWindow: TIME_WINDOW_SECONDS,
  };
}

/**
 * Get engagement rates as percentages
 */
export function getEngagementPercentages(stats: EngagementRatioStats) {
  return {
    suggested: Math.round(stats.suggestedEngagement.engagementRate * 100),
    ads: Math.round(stats.adsEngagement.engagementRate * 100),
  };
}

/**
 * Get a summary message about engagement
 */
export function getEngagementSummary(stats: EngagementRatioStats): string {
  const percentages = getEngagementPercentages(stats);
  
  if (percentages.suggested > 10) {
    return `You engage frequently with suggested content (${percentages.suggested}% engagement rate)`;
  } else if (percentages.suggested > 5) {
    return `You moderately engage with suggested content (${percentages.suggested}% engagement rate)`;
  } else {
    return `You rarely engage with suggested content (${percentages.suggested}% engagement rate)`;
  }
}