/**
 * Content Ratio Calculator
 * 
 * This calculator determines how much content you intentionally sought out
 * versus how much was suggested by Instagram's algorithm or shown as ads.
 * 
 * DEFINITIONS:
 * 
 * 1. TOTAL VIEWED CONTENT (DEDUPLICATED)
 *    - All posts viewed (posts_viewed)
 *    - All videos watched (videos_watched)
 *    - All ads watched (ads_watched)
 * 
 * 2. INTENDED CONTENT
 *    Content from accounts you deliberately interacted with:
 *    - Accounts you follow (following)
 *    - Accounts you searched for (profile_searches)
 * 
 * 3. SUGGESTED CONTENT
 *    Everything else that Instagram's algorithm showed you:
 *    - Posts & Videos - Intended = Suggested
 * 
 * 4. ADS
 *    - All ads watched (ads_watched)
 * 
 * FORMULA:
 * --------
 * Total Viewed = posts_viewed + videos_watched + ads_watched
 * Intended = viewed content where author is in (following OR profile_searches)
 * Suggested = (posts_viewed + videos_watched) - Intended
 * Ads = ads_watched
 * 
 * RATIOS:
 * -------
 * Intended Ratio = Intended / Total Viewed
 * Suggested Ratio = Suggested / Total Viewed
 * Ads Ratio = Ads / Total Viewed
 * 
 * Note: All ratios are calculated against Total Viewed (which includes ads),
 * so the three ratios will always sum to 100%.
 */

import { DataWrapper } from '../data/dataWrapper';
import { Following, ProfileSearch } from '@/types/instagram';

export interface ContentRatioStats {
  totalViewed: number;
  intendedContent: number;
  suggestedContent: number;
  adsViewed: number;
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
export function calculateContentRatio(wrapper: DataWrapper): ContentRatioStats {
  const postsViewed = wrapper.getPostsViewed();
  const videosWatched = wrapper.getVideosWatched();
  const following = wrapper.getFollowing();
  const profileSearches = wrapper.getProfileSearches();
  const adsViewed = wrapper.getAdsViewed();

  // Create a Set of intended authors (accounts you follow or searched for)
  const intendedAuthors = new Set<string>();
  
  following.forEach((f: Following) => intendedAuthors.add(f.author));
  profileSearches.forEach((s: ProfileSearch) => intendedAuthors.add(s.author));

  // Create a Set of ads for quick lookup (author + timestamp)
  const adsSet = new Set<string>();
  adsViewed.forEach(ad => {
    adsSet.add(`${ad.author}:${ad.timestamp}`);
  });

  // Combine all content and deduplicate by author + timestamp
  const allContent = new Map<string, { author: string; timestamp: number }>();
  
  [...postsViewed, ...videosWatched, ...adsViewed].forEach(item => {
    const key = `${item.author}:${item.timestamp}`;
    if (!allContent.has(key)) {
      allContent.set(key, { author: item.author, timestamp: item.timestamp });
    }
  });

  // Categorize each unique item
  let intendedCount = 0;
  let suggestedCount = 0;
  let adsCount = 0;

  allContent.forEach((item, key) => {
    // Priority 1: Is it an ad?
    if (adsSet.has(key)) {
      adsCount++;
    }
    // Priority 2: Is it intended content?
    else if (intendedAuthors.has(item.author)) {
      intendedCount++;
    }
    // Priority 3: It's suggested content
    else {
      suggestedCount++;
    }
  });

  // Calculate totals
  const totalViewed = allContent.size;

  // Calculate ratios (all against Total Viewed)
  const intendedRatio = totalViewed > 0 ? intendedCount / totalViewed : 0;
  const suggestedRatio = totalViewed > 0 ? suggestedCount / totalViewed : 0;
  const adsRatio = totalViewed > 0 ? adsCount / totalViewed : 0;

  return {
    totalViewed,
    intendedContent: intendedCount,
    suggestedContent: suggestedCount,
    adsViewed: adsCount,
    intendedRatio,
    suggestedRatio,
    adsRatio,
    breakdown: {
      intended: intendedCount,
      suggested: suggestedCount,
      ads: adsCount,
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