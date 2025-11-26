import {
  DataFileType,
  ParsedInstagramData,
  ParsedFile
} from '@/types/instagram';

/**
 * Configuration for each file type - defines how to extract data
 */
const FILE_CONFIGS = {
  liked_posts: {
  keywords: ['liked', 'post'], 
  dataPath: ['likes_media_likes'],
    parse: (item: any) => ({
      link: item.string_list_data?.[0]?.href || '',
      author: item.title || '',
      timestamp: item.timestamp || item.string_list_data?.[0]?.timestamp || 0
    })
  },
  
  liked_comments: {
    keywords: ['liked', 'comment'], 
    dataPath: ['likes_media_likes'],
    parse: (item: any) => ({
      link: item.string_list_data?.[0]?.href || '',
      type: item.string_list_data?.[0]?.href?.includes('/reel/') ? 'reel' : 'post',
      timestamp: item.timestamp || item.string_list_data?.[0]?.timestamp || 0
    })
  },

  profile_searches: {
    keywords: ['profile_search', 'searches_user'],
    dataPath: ['searches_user'],
    parse: (item: any) => ({
      author: item.title || '',  // ← FIX: Use 'title' not Search.value
      profileLink: item.string_list_data?.[0]?.href || '',
      timestamp: item.string_list_data?.[0]?.timestamp || 0
    })
  },
    
  link_history: {
    keywords: ['link', 'history'],
    dataPath: ['ig_custom_link_history'],
    parse: (item: any) => ({
      url: item.label_values?.[0]?.value || '',  // ← FIX: Use label_values
      timestamp: item.timestamp || 0
    })
  },

  following: {
    keywords: ['following'],
    dataPath: ['relationships_following'],
    parse: (item: any) => ({
      author: item.title || '',  // ← FIX: Use 'title' not value
      profileLink: item.string_list_data?.[0]?.href || '',
      timestamp: item.string_list_data?.[0]?.timestamp || 0
    })
  },

  videos_watched: {
    keywords: ['video', 'watched'],
    dataPath: ['impressions_history_videos_watched'],
    parse: (item: any) => ({
      author: item.string_map_data?.Author?.value || '',
      title: item.string_map_data?.['Video Title']?.value,
      timestamp: item.string_map_data?.Time?.timestamp || 0  // ← FIX: Use Time.timestamp
    })
  },

  place_searches: {
    keywords: ['place', 'search'],
    dataPath: ['searches_place'],
    parse: (item: any) => ({
      place: item.string_map_data?.Search?.value || '',
      timestamp: item.string_map_data?.Time?.timestamp || 0  // ← FIX: Use Time.timestamp
    })
  },

  keyword_searches: {
    keywords: ['keyword', 'search'],
    dataPath: ['searches_keyword'],
    parse: (item: any) => ({
      keyword: item.string_map_data?.Search?.value || '',
      timestamp: item.string_map_data?.Time?.timestamp || 0  // ← FIX: Use Time.timestamp
    })
  },
  

  
  recommended_topics: {
    keywords: ['recommended', 'topic'],
    dataPath: ['topics_your_topics'],
    parse: (item: any) => ({
      topic: item.string_map_data?.Name?.value || item.name || '',
      weight: item.weight
    })
  },
  
  ads_watched: {
    keywords: ['ads', 'watched'],
    dataPath: ['impressions_history_ads_seen'],
    parse: (item: any) => ({
      author: item.string_map_data?.Author?.value || '',
      timestamp: item.string_map_data?.Time?.timestamp || 0  // ← FIX: Use Time.timestamp
    })
  },

  posts_viewed: {
    keywords: ['posts', 'viewed'],
    dataPath: ['impressions_history_posts_seen'],
    parse: (item: any) => ({
      author: item.string_map_data?.Author?.value || '',
      timestamp: item.string_map_data?.Time?.timestamp || 0  // ← FIX: Use Time.timestamp
    })
  }
};

/**
 * Detect file type from filename or data structure
 */
export function detectDataType(data: any, filename: string): DataFileType {
  const lower = filename.toLowerCase();
  
  // Try each config
  for (const [type, config] of Object.entries(FILE_CONFIGS)) {
    // Check if filename contains all keywords
    const matchesFilename = config.keywords.every(keyword => 
      lower.includes(keyword)
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

/**
 * Parse any Instagram file using config
 */
export function parseInstagramFile(data: any, type: DataFileType): any[] {
  if (type === 'unknown') {
    return [];
  }
  
  const config = FILE_CONFIGS[type as keyof typeof FILE_CONFIGS];
  if (!config) {
    return [];
  }
  
  try {
    const items = extractArray(data, config.dataPath);
    const parsed = items.map((item: any) => config.parse(item));
    
    // Filter out empty items
    return parsed.filter((item: any) => {
      const values = Object.values(item);
      return values.some(v => v !== '' && v !== null && v !== undefined);
    });
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
    adsWatched: [],
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
    'keyword_searches': 'keywordSearches',
    'recommended_topics': 'recommendedTopics',
    'ads_watched': 'adsWatched',
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