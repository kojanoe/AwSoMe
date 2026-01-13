import { DataWrapper } from '../data/dataWrapper';

export interface EngagementRatioStats {
  suggestedEngagement: {
    totalViewed: number;
    totalLiked: number;
    totalSaved: number;
    engagementRate: number;
  };
  adsEngagement: {
    totalViewed: number;
    totalLiked: number;
    totalClicked: number;
    engagementRate: number;
  };
  timeWindow: number; // Not used anymore but kept for compatibility
}

/**
 * Calculate engagement rates based on liked posts
 * New approach: Uses all liked posts and categorizes them by content source
 * Uses same deduplication logic as contentRatio for consistency
 */
export function calculateEngagementRatio(wrapper: DataWrapper): EngagementRatioStats {
  // Get all content sources
  const following = wrapper.getFollowing();
  const searches = wrapper.getAllSearches();
  const adsViewed = wrapper.getAdsViewed();
  const likedPosts = wrapper.getLikedPosts();
  const adsClicked = wrapper.getAdsClicked();
  const savedPosts = wrapper.getSavedPosts();
  const postsViewed = wrapper.getPostsViewed();
  const videosWatched = wrapper.getVideosWatched();

  // Create sets for faster lookups
  const followingSet = new Set(following.map(f => f.author.toLowerCase()));
  const searchedAuthorsSet = new Set(
    searches
      .filter(s => s.type === 'profile')
      .map(s => s.value.toLowerCase())
  );
  
  // Create intended authors set (following + searches)
  const intendedAuthors = new Set([...followingSet, ...searchedAuthorsSet]);

  // Create ads set for matching (author:timestamp)
  const adsSet = new Set<string>();
  adsViewed.forEach(ad => {
    adsSet.add(`${ad.author}:${ad.timestamp}`);
  });

  // SAME DEDUPLICATION AS CONTENTRATIO
  // Combine all content and deduplicate by author + timestamp
  const allContent = new Map<string, { author: string; timestamp: number; isAd: boolean }>();
  
  [...postsViewed, ...videosWatched, ...adsViewed].forEach(item => {
    const key = `${item.author}:${item.timestamp}`;
    if (!allContent.has(key)) {
      allContent.set(key, { 
        author: item.author, 
        timestamp: item.timestamp,
        isAd: adsSet.has(key)
      });
    }
  });

  // Categorize deduplicated content
  let intendedViewed = 0;
  let suggestedViewed = 0;
  let adsViewedCount = 0;

  allContent.forEach((item) => {
    const authorLower = item.author?.toLowerCase();
    
    // Priority 1: Is it an ad?
    if (item.isAd) {
      adsViewedCount++;
    }
    // Priority 2: Is it intended content?
    else if (authorLower && intendedAuthors.has(authorLower)) {
      intendedViewed++;
    }
    // Priority 3: It's suggested content
    else {
      suggestedViewed++;
    }
  });

  // Categorize liked posts
  let suggestedLikes = 0;
  let adsLikes = 0;

  for (const like of likedPosts) {
    const author = like.author?.toLowerCase();
    if (!author) continue;

    // Skip if it's intended content (following or searched)
    if (intendedAuthors.has(author)) {
      continue;
    }

    // Check if author appears in ads
    const isAdAuthor = adsViewed.some(ad => ad.author?.toLowerCase() === author);
    
    if (isAdAuthor) {
      adsLikes++;
    } else {
      suggestedLikes++;
    }
  }

  // Categorize saved posts
  let suggestedSaves = 0;

  for (const save of savedPosts) {
    const author = save.author?.toLowerCase();
    if (!author) continue;

    // Skip if it's intended content
    if (intendedAuthors.has(author)) {
      continue;
    }

    suggestedSaves++;
  }

  // Calculate engagement rates
  const adsClickCount = adsClicked.length;

  const suggestedEngagementRate = suggestedViewed > 0 
    ? (suggestedLikes + suggestedSaves) / suggestedViewed 
    : 0;

  const adsEngagementRate = adsViewedCount > 0 
    ? (adsLikes + adsClickCount) / adsViewedCount 
    : 0;

  

  return {
    suggestedEngagement: {
      totalViewed: suggestedViewed,
      totalLiked: suggestedLikes,
      totalSaved: suggestedSaves,
      engagementRate: suggestedEngagementRate,
    },
    adsEngagement: {
      totalViewed: adsViewedCount,
      totalLiked: adsLikes,
      totalClicked: adsClickCount,
      engagementRate: adsEngagementRate,
    },
    timeWindow: 300, // Kept for compatibility, not used anymore
  };
}

/**
 * Get engagement percentages as whole numbers
 */
export function getEngagementPercentages(stats: EngagementRatioStats) {
  return {
    suggested: Math.round(stats.suggestedEngagement.engagementRate * 100),
    ads: Math.round(stats.adsEngagement.engagementRate * 100),
  };
}

/**
 * Get human-readable engagement summary
 */
export function getEngagementSummary(stats: EngagementRatioStats): string {
  const suggestedPercent = Math.round(stats.suggestedEngagement.engagementRate * 100);
  
  if (suggestedPercent > 10) {
    return `You engage frequently with suggested content (${suggestedPercent}% engagement rate)`;
  }
  
  if (suggestedPercent > 5) {
    return `You moderately engage with suggested content (${suggestedPercent}% engagement rate)`;
  }
  
  return `You rarely engage with suggested content (${suggestedPercent}% engagement rate)`;
}