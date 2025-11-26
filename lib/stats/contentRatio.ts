/**
 * Content Ratio Calculator
 * 
 * This calculator determines how much content you intentionally sought out
 * versus how much was suggested by Instagram's algorithm or shown as ads.
 * 
 * DEFINITIONS:
 * 
 * 1. TOTAL VIEWED CONTENT
 *    - All posts viewed (posts_viewed)
 *    - All videos watched (videos_watched)
 * 
 * 2. INTENDED CONTENT
 *    Content from accounts you deliberately interacted with:
 *    - Accounts you follow (following)
 *    - Accounts you searched for (profile_searches)
 * 
 * 3. ADS
 *    - All ads watched (ads_watched)
 * 
 * 4. SUGGESTED CONTENT
 *    Everything else that Instagram's algorithm showed you:
 *    - Total viewed - Intended - Ads = Suggested
 * 
 * FORMULA:
 * --------
 * Total Viewed = posts_viewed + videos_watched + ads_watched
 * Intended = viewed content where author is in (following OR profile_searches)
 * Suggested = Posts & Videos - Intended
 * Ads = ads_watched

 * RATIOS:
 * -------
 * Intended Ratio = Intended / Total Viewed
 * Suggested Ratio = Suggested / Total Viewed
 * Ads Ratio = Ads / Total Viewed
 * 
 * Note: All ratios are calculated against Total Viewed (which includes ads),
 * so the three ratios will always sum to 100%.
 */

import { InstagramDataStore } from '../data/dataStore';
import { Following, ProfileSearch } from '@/types/instagram';

export interface ContentRatioStats {
  totalViewed: number;
  intendedContent: number;
  suggestedContent: number;
  adsWatched: number;
  intendedRatio: number;
  suggestedRatio: number;
  adsRatio: number;
  breakdown: {
    intended: number;
    suggested: number;
    ads: number;
  };
}

/**
 * Calculate the ratio between intended content and suggested content
 */
export function calculateContentRatio(store: InstagramDataStore): ContentRatioStats {
  const postsViewed = store.getPostsViewed();
  const videosWatched = store.getVideosWatched();
  const following = store.getFollowing();
  const profileSearches = store.getProfileSearches();
  const adsWatched = store.getAdsWatched();

  // Create a Set of intended authors (accounts you follow or searched for)
  const intendedAuthors = new Set<string>();
  
  following.forEach((f: Following) => intendedAuthors.add(f.author));
  profileSearches.forEach((s: ProfileSearch) => intendedAuthors.add(s.author));

  // Combine all viewed content (posts + videos)
  const allViewedContent = [...postsViewed, ...videosWatched];

  // Categorize content
  let intendedCount = 0;
  let suggestedCount = 0;

  allViewedContent.forEach(content => {
    if (intendedAuthors.has(content.author)) {
      intendedCount++;
    } else {
      suggestedCount++;
    }
  });

  // Calculate totals
  const totalViewed = allViewedContent.length + adsWatched.length;

  // Calculate ratios (all against Total Viewed)
  const intendedRatio = totalViewed > 0 ? intendedCount / totalViewed : 0;
  const suggestedRatio = totalViewed > 0 ? suggestedCount / totalViewed : 0;
  const adsRatio = totalViewed > 0 ? adsWatched.length / totalViewed : 0;

  return {
    totalViewed,
    intendedContent: intendedCount,
    suggestedContent: suggestedCount,
    adsWatched: adsWatched.length,
    intendedRatio,
    suggestedRatio,
    adsRatio,
    breakdown: {
      intended: intendedCount,
      suggested: suggestedCount,
      ads: adsWatched.length,
    },
  };
}

/**
 * Get content ratio as percentages
 */
export function getContentRatioPercentages(stats: ContentRatioStats) {
  return {
    intended: Math.round(stats.intendedRatio * 100),
    suggested: Math.round(stats.suggestedRatio * 100),
    ads: Math.round(stats.adsRatio * 100),
  };
}

/**
 * Get a summary message about content consumption
 */
export function getContentRatioSummary(stats: ContentRatioStats): string {
  const percentages = getContentRatioPercentages(stats);
  
  if (percentages.intended > 60) {
    return `You mostly see content you intentionally sought out (${percentages.intended}% intended)`;
  } else if (percentages.suggested > 50) {
    return `Instagram shows you more suggested content (${percentages.suggested}%) than content you actively chose`;
  } else if (percentages.ads > 20) {
    return `You see a significant amount of ads (${percentages.ads}% of all content)`;
  } else {
    return `Your content is balanced between intended (${percentages.intended}%) and suggested (${percentages.suggested}%)`;
  }
}