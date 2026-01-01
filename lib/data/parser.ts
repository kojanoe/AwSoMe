import {
  DataFileType,
  ParsedInstagramData,
  ParsedFile
} from '@/types/instagram';

/**
 * Configuration for each file type - defines how to extract data
 * Updated to match actual Instagram export filenames
 */
const FILE_CONFIGS = {
  liked_posts: {
    keywords: ['liked_posts'],
    dataPath: ['likes_media_likes'],
    parse: (item: any) => ({
      link: item.string_list_data?.[0]?.href || '',
      author: item.title || '',
      timestamp: item.timestamp || item.string_list_data?.[0]?.timestamp || 0
    })
  },
  
  liked_comments: {
    keywords: ['liked_comments'],
    dataPath: ['likes_media_likes'],
    parse: (item: any) => ({
      link: item.string_list_data?.[0]?.href || '',
      type: item.string_list_data?.[0]?.href?.includes('/reel/') ? 'reel' : 'post',
      timestamp: item.timestamp || item.string_list_data?.[0]?.timestamp || 0
    })
  },

  profile_searches: {
    keywords: ['profile_searches'],
    dataPath: ['searches_user'],
    parse: (item: any) => ({
      author: item.title || '',
      profileLink: item.string_list_data?.[0]?.href || '',
      timestamp: item.string_list_data?.[0]?.timestamp || 0
    })
  },
    
  link_history: {
    keywords: ['link_history'],
    dataPath: ['ig_custom_link_history'],
    parse: (item: any) => ({
      url: item.label_values?.[0]?.value || '',
      timestamp: item.timestamp || 0
    })
  },

  following: {
    keywords: ['following'],
    dataPath: ['relationships_following'],
    parse: (item: any) => ({
      author: item.title || '',
      profileLink: item.string_list_data?.[0]?.href || '',
      timestamp: item.string_list_data?.[0]?.timestamp || 0
    })
  },

  videos_watched: {
    keywords: ['videos_watched'],
    dataPath: ['impressions_history_videos_watched'],
    parse: (item: any) => ({
      author: item.string_map_data?.Author?.value || '',
      title: item.string_map_data?.['Video Title']?.value,
      timestamp: item.string_map_data?.Time?.timestamp || 0
    })
  },

  place_searches: {
    keywords: ['place_searches'],
    dataPath: ['searches_place'],
    parse: (item: any) => ({
      place: item.string_map_data?.Search?.value || '',
      timestamp: item.string_map_data?.Time?.timestamp || 0
    })
  },

  word_or_phrase_searches: {
    keywords: ['word_or_phrase_searches'],
    dataPath: ['searches_keyword'],
    parse: (item: any) => ({
      keyword: item.string_map_data?.Search?.value || '',
      timestamp: item.string_map_data?.Time?.timestamp || 0
    })
  },
  
  recommended_topics: {
    keywords: ['recommended_topics'],
    dataPath: ['topics_your_topics'],
    parse: (item: any) => ({
      topic: item.string_map_data?.Name?.value || item.name || '',
      weight: item.weight
    })
  },
  
  ads_viewed: {
    keywords: ['ads_viewed'],
    dataPath: ['impressions_history_ads_seen'],
    parse: (item: any) => ({
      author: item.string_map_data?.Author?.value || '',
      timestamp: item.string_map_data?.Time?.timestamp || 0
    })
  },

  posts_viewed: {
    keywords: ['posts_viewed'],
    dataPath: ['impressions_history_posts_seen'],
    parse: (item: any) => ({
      author: item.string_map_data?.Author?.value || '',
      timestamp: item.string_map_data?.Time?.timestamp || 0
    })
  }
};

/**
 * Detect file type from filename or data structure
 */
export function detectDataType(data: any, filename: string): DataFileType {
  const lower = filename.toLowerCase();
  
  // Try each config - now matching exact filenames
  for (const [type, config] of Object.entries(FILE_CONFIGS)) {
    // Check if filename contains the keyword (exact match)
    const matchesFilename = config.keywords.some(keyword => 
      lower.includes(keyword.toLowerCase())
    );
    
    if (matchesFilename) {
      return type as DataFileType;
    }
    
    // Check if data structure matches
    if (typeof data === 'object' && !Array.isArray(data)) {
      for (const path of config.dataPath) {
        if (data[path]) {
          return type as DataFileType;
        }
      }
    }
  }
  
  return 'unknown';
}

/**
 * Extract array from data using config paths
 */
function extractArray(data: any, paths: string[]): any[] {
  // If already an array, return it
  if (Array.isArray(data)) {
    return data;
  }
  
  // Try each path
  for (const path of paths) {
    if (data[path] && Array.isArray(data[path])) {
      return data[path];
    }
  }
  
  return [];
}
export function parseInstagramFile(
  data: any, 
  type: DataFileType,
  dateRange?: { start: number; end: number }
): any[] {
  if (type === 'unknown') {
    return [];
  }
  
  const config = FILE_CONFIGS[type as keyof typeof FILE_CONFIGS];
  if (!config) {
    return [];
  }
  
  // Files that should NOT be filtered by date range
  const noFilterTypes: DataFileType[] = [
    'following',           // Keep all follows - they persist
    'recommended_topics'   // No timestamps
  ];
  
  try {
    const items = extractArray(data, config.dataPath);
    const parsed = items.map((item: any) => config.parse(item));
    
    // Filter out empty items
    let filtered = parsed.filter((item: any) => {
      const values = Object.values(item);
      return values.some(v => v !== '' && v !== null && v !== undefined);
    });
    
    // Apply date range filter ONLY if provided AND file type should be filtered
    if (dateRange && !noFilterTypes.includes(type)) {
      filtered = filtered.filter((item: any) => {
        // If item has timestamp, check if it's in range
        if (typeof item.timestamp === 'number' && item.timestamp > 0) {
          return item.timestamp >= dateRange.start && item.timestamp <= dateRange.end;
        }
        // Keep items without timestamps (shouldn't happen for most types)
        return true;
      });
    }
    
    return filtered;
  } catch (error) {
    console.error(`Error parsing ${type}:`, error);
    return [];
  }
}

export function combineInstagramData(parsedFiles: ParsedFile[]): ParsedInstagramData {
  const combined: ParsedInstagramData = {
    likedComments: [],
    likedPosts: [],  
    profileSearches: [],
    linkHistory: [],
    following: [],
    videosWatched: [],
    placeSearches: [],
    keywordSearches: [],
    recommendedTopics: [],
    adsViewed: [],
    postsViewed: []
  };
  
  const typeMapping: Record<string, keyof ParsedInstagramData> = {
    'liked_comments': 'likedComments',
    'liked_posts': 'likedPosts', 
    'profile_searches': 'profileSearches',
    'link_history': 'linkHistory',
    'following': 'following',
    'videos_watched': 'videosWatched',
    'place_searches': 'placeSearches',
    'word_or_phrase_searches': 'keywordSearches',
    'recommended_topics': 'recommendedTopics',
    'ads_viewed': 'adsViewed',
    'posts_viewed': 'postsViewed'
  };
  
  for (const file of parsedFiles) {
    if (!file.success || !file.data) continue;
    
    if (!Array.isArray(file.data)) {
      console.warn(`Data for ${file.type} is not an array, skipping`);
      continue;
    }
    
    const targetKey = typeMapping[file.type];
    if (targetKey) {
      combined[targetKey].push(...file.data);
    }
  }
  
  return combined;
}