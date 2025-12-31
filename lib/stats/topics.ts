import { InstagramDataStore } from '../data/dataStore';

export interface TopicsStats {
  totalTopics: number;
  topTopics: Array<{
    topic: string;
    matchedInSearches: boolean;
    matchedInProfiles: boolean;
  }>;
  matchAnalysis: {
    totalTopics: number;
    matchedViaKeywords: number;
    matchedViaProfiles: number;
    totalMatched: number;
    matchPercentage: number;
  };
  unmatchedTopics: string[];
}

function topicMatchesKeyword(topic: string, keyword: string): boolean {
  if (!topic || !keyword || typeof topic !== 'string' || typeof keyword !== 'string') {
    return false;
  }
  
  const topicLower = topic.toLowerCase();
  const keywordLower = keyword.toLowerCase();
  
  if (topicLower === keywordLower) return true;
  
  if (topicLower.includes(keywordLower) || keywordLower.includes(topicLower)) {
    return true;
  }
  
  return false;
}

function topicMatchesProfile(topic: string, username: string): boolean {
  if (!topic || !username || typeof topic !== 'string' || typeof username !== 'string') {
    return false;
  }
  
  const topicLower = topic.toLowerCase();
  const usernameLower = username.toLowerCase();
  
  const topicWords = topicLower.split(/\s+/);
  return topicWords.some(word => 
    word.length > 3 && usernameLower.includes(word)
  );
}

export function calculateTopics(store: InstagramDataStore): TopicsStats {
  const recommendedTopics = store.getRecommendedTopics();
  const keywordSearches = store.getKeywordSearches();
  const profileSearches = store.getProfileSearches();

  const validTopics = recommendedTopics.filter(
    topic => topic && topic.topic && typeof topic.topic === 'string' && topic.topic.trim() !== ''
  );

  const searchKeywords = new Set(
    keywordSearches
      .filter(s => s.value && typeof s.value === 'string')
      .map(s => s.value)
  );
  const searchProfiles = new Set(
    profileSearches
      .filter(s => s.author && typeof s.author === 'string')
      .map(s => s.author)
  );

  const analyzedTopics = validTopics.map(topic => {
    let matchedInSearches = false;
    let matchedInProfiles = false;

    for (const keyword of searchKeywords) {
      if (topicMatchesKeyword(topic.topic, keyword)) {
        matchedInSearches = true;
        break;
      }
    }

    for (const profile of searchProfiles) {
      if (topicMatchesProfile(topic.topic, profile)) {
        matchedInProfiles = true;
        break;
      }
    }

    return {
      topic: topic.topic,
      matchedInSearches,
      matchedInProfiles,
    };
  });

  const matchedViaKeywords = analyzedTopics.filter(t => t.matchedInSearches).length;
  const matchedViaProfiles = analyzedTopics.filter(t => t.matchedInProfiles).length;
  const totalMatched = analyzedTopics.filter(t => 
    t.matchedInSearches || t.matchedInProfiles
  ).length;

  const matchPercentage = validTopics.length > 0
    ? Math.round((totalMatched / validTopics.length) * 100)
    : 0;

  const unmatchedTopics = analyzedTopics
    .filter(t => !t.matchedInSearches && !t.matchedInProfiles)
    .map(t => t.topic);

  // Return ALL topics instead of top 15
  const topTopics = analyzedTopics;

  return {
    totalTopics: validTopics.length,
    topTopics,
    matchAnalysis: {
      totalTopics: validTopics.length,
      matchedViaKeywords,
      matchedViaProfiles,
      totalMatched,
      matchPercentage,
    },
    unmatchedTopics,
  };
}