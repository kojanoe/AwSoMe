import { ParsedInstagramData } from '@/types/instagram';

/**
 * DataWrapper - Wraps parsed Instagram data with helper methods
 * Provides convenient access and computed properties for stats calculations
 */
export class DataWrapper {
  private data: ParsedInstagramData;

  constructor(data: ParsedInstagramData) {
    this.data = data;
  }

  // ============================================
  // RAW DATA GETTERS
  // ============================================

  getLikedComments() {
    return this.data.likedComments;
  }

  getLikedPosts() {
    return this.data.likedPosts;
  }

  getProfileSearches() {
    return this.data.profileSearches;
  }

  getLinkHistory() {
    return this.data.linkHistory;
  }

  getFollowing() {
    return this.data.following;
  }

  getVideosWatched() {
    return this.data.videosWatched;
  }

  getPlaceSearches() {
    return this.data.placeSearches;
  }

  getKeywordSearches() {
    return this.data.keywordSearches;
  }

  getRecommendedTopics() {
    return this.data.recommendedTopics;
  }

  getAdsViewed() {
    return this.data.adsViewed;
  }

  getPostsViewed() {
    return this.data.postsViewed;
  }

  getAllData() {
    return this.data;
  }

  // ============================================
  // PROCESSED DATA GETTERS
  // ============================================

  /**
   * Get set of followed account usernames (lowercase)
   */
  getFollowedAccountsSet(): Set<string> {
    return new Set(this.data.following.map(f => f.author.toLowerCase()));
  }

  /**
   * Get posts categorized by followed/not followed
   */
  getCategorizedPosts() {
    const followedAccounts = this.getFollowedAccountsSet();
    
    const followed = this.data.postsViewed.filter(post => 
      followedAccounts.has(post.author.toLowerCase())
    );
    
    const notFollowed = this.data.postsViewed.filter(post => 
      !followedAccounts.has(post.author.toLowerCase())
    );
    
    return { followed, notFollowed };
  }

  /**
   * Get all searches (profile, keyword, place combined)
   */
  getAllSearches() {
    return [
      ...this.data.profileSearches.map(s => ({ type: 'profile' as const, value: s.author, timestamp: s.timestamp })),
      ...this.data.keywordSearches.map(s => ({ type: 'keyword' as const, value: s.value, timestamp: s.timestamp })),
      ...this.data.placeSearches.map(s => ({ type: 'place' as const, value: s.value, timestamp: s.timestamp }))
    ];
  }

  /**
   * Get all activity with timestamps
   */
  getAllActivityWithTimestamps() {
    return [
      ...this.data.postsViewed.map(p => ({ type: 'post_viewed' as const, timestamp: p.timestamp, author: p.author })),
      ...this.data.videosWatched.map(v => ({ type: 'video_watched' as const, timestamp: v.timestamp, author: v.author })),
      ...this.data.likedComments.map(c => ({ type: 'comment_liked' as const, timestamp: c.timestamp, link: c.link }))
    ].filter(item => item.timestamp > 0);
  }

  /**
   * Get date range of data
   */
  getDateRange() {
    const timestamps = this.getAllActivityWithTimestamps()
      .map(a => a.timestamp)
      .filter(t => t > 0)
      .sort((a, b) => a - b);
    
    if (timestamps.length === 0) {
      return { earliest: null, latest: null };
    }
    
    return {
      earliest: new Date(timestamps[0] * 1000),
      latest: new Date(timestamps[timestamps.length - 1] * 1000)
    };
  }

  // ============================================
  // AVAILABILITY CHECKS
  // ============================================

  hasLikedComments() {
    return this.data.likedComments.length > 0;
  }
  
  hasLikedPosts() {
    return this.data.likedPosts.length > 0;
  }

  hasPostsViewed() {
    return this.data.postsViewed.length > 0;
  }

  hasVideosWatched() {
    return this.data.videosWatched.length > 0;
  }

  hasFollowing() {
    return this.data.following.length > 0;
  }

  hasSearches() {
    return this.getAllSearches().length > 0;
  }

  hasAnyData() {
    return this.hasLikedComments() || 
           this.hasPostsViewed() || 
           this.hasVideosWatched() || 
           this.hasFollowing() || 
           this.hasSearches();
  }
}

/**
 * Create data wrapper from parsed files
 */
export function createDataWrapper(data: ParsedInstagramData): DataWrapper {
  return new DataWrapper(data);
}