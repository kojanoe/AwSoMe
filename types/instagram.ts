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

export interface AdViewed extends TimestampData {
  author: string;
}

export interface PostViewed extends TimestampData {
  author: string;
}

// Unified data structure
export interface ParsedInstagramData {
  likedComments: LikedComment[];
  likedPosts: LikedPost[];
  profileSearches: ProfileSearch[];
  linkHistory: LinkHistory[];
  following: Following[];
  videosWatched: VideoWatched[];
  placeSearches: PlaceSearch[];
  keywordSearches: KeywordSearch[];
  recommendedTopics: RecommendedTopic[];
  adsViewed: AdViewed[];
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
  | 'word_or_phrase_searches'
  | 'recommended_topics'
  | 'ads_viewed'
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