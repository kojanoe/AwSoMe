// types/instagram.ts

// Common fields
interface TimestampData {
  timestamp: number;
}

// Parsed data types (after we process the JSON)
export interface LikedPost extends TimestampData {
  link: string;
  author: string;
}

export interface LikedComment extends TimestampData {
  link: string;
  type: 'post' | 'reel';
}

export interface ProfileSearch extends TimestampData {
  author: string;
  profileLink: string;
}

export interface LinkHistory {
  url: string;
  timestamp?: number;
}

export interface Following extends TimestampData {
  author: string;
  profileLink: string;
}

export interface VideoWatched extends TimestampData {
  author: string;
}

export interface PlaceSearch extends TimestampData {
  value: string;
}

export interface KeywordSearch extends TimestampData {
  value: string;
}

export interface RecommendedTopic {
  topic: string;
}

export interface AdWatched extends TimestampData {
  author: string;
}

export interface PostViewed extends TimestampData {
  author: string;
}

// Unified data structure
export interface ParsedInstagramData {
  likedComments: LikedComment[];
  likedPosts: LikedPost[];      // ← ADD THIS
  profileSearches: ProfileSearch[];
  linkHistory: LinkHistory[];
  following: Following[];
  videosWatched: VideoWatched[];
  placeSearches: PlaceSearch[];
  keywordSearches: KeywordSearch[];
  recommendedTopics: RecommendedTopic[];
  adsWatched: AdWatched[];
  postsViewed: PostViewed[];
}

// File type identification
export type DataFileType = 
  | 'liked_comments'
  | 'liked_posts'      
  | 'profile_searches'
  | 'link_history'
  | 'following'
  | 'videos_watched'
  | 'place_searches'
  | 'keyword_searches'
  | 'recommended_topics'
  | 'ads_watched'
  | 'posts_viewed'
  | 'unknown';

// Result from parsing a single file
export interface ParsedFile {
  filename: string;
  type: DataFileType;
  recordCount: number;
  success: boolean;
  error?: string;
  data?: any;
}

// Remove old Statistics interface and add this at the end:

import { BasicStats } from '@/lib/stats/basic';
import { FollowerStats } from '@/lib/stats/followers';
import { EngagementStats } from '@/lib/stats/engagement';
import { VideoStats } from '@/lib/stats/videos';
import { SearchStats } from '@/lib/stats/searches';
import { TimelineStats } from '@/lib/stats/timeline';

export interface Statistics {
  basic: BasicStats;
  followers: FollowerStats;
  engagement: EngagementStats;
  videos: VideoStats;
  searches: SearchStats;
  timeline: TimelineStats;
}
