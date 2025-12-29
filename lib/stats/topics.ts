/**
 * Topics Analysis
 * Compares Instagram's recommended topics against actual user behavior
 */

import { InstagramDataStore } from '../data/dataStore';

export interface TopicsStats {
  totalTopics: number;
  topTopics: Array<{
    topic: string;
    matchedInSearches: boolean; // Found in keyword searches
    matchedInProfiles: boolean; // Found in profile searches
  }>;
  matchAnalysis: {
    totalTopics: number;
    matchedViaKeywords: number;
    matchedViaProfiles: number;
    totalMatched: number;
    matchPercentage: number; // % of topics that match behavior
  };
  unmatchedTopics: string[]; // Topics with no matching behavior
}

/**
 * Check if topic appears in search keyword
 * Uses fuzzy matching (partial, case-insensitive)
 */
function topicMatchesKeyword(topic: string, keyword: string): boolean {
  // Safety checks
  if (!topic || !keyword || typeof topic !== 'string' || typeof keyword !== 'string') {
    return false;
  }
  
  const topicLower = topic.toLowerCase();
  const keywordLower = keyword.toLowerCase();
  
  // Exact match
  if (topicLower === keywordLower) return true;
  
  // Partial match (topic contains keyword or vice versa)
  if (topicLower.includes(keywordLower) || keywordLower.includes(topicLower)) {
    return true;
  }
  
  return false;
}

/**
 * Check if topic appears in profile username
 * More lenient matching for usernames
 */
function topicMatchesProfile(topic: string, username: string): boolean {
  // Safety checks
  if (!topic || !username || typeof topic !== 'string' || typeof username !== 'string') {
    return false;
  }
  
  const topicLower = topic.toLowerCase();
  const usernameLower = username.toLowerCase();
  
  // Check if any word from topic appears in username
  const topicWords = topicLower.split(/\s+/);
  return topicWords.some(word => 
    word.length > 3 && usernameLower.includes(word)
  );
}

export function calculateTopics(store: InstagramDataStore): TopicsStats {
  const recommendedTopics = store.getRecommendedTopics();
  const keywordSearches = store.getKeywordSearches();
  const profileSearches = store.getProfileSearches();

  // Filter out invalid topics (empty, null, or non-string)
  const validTopics = recommendedTopics.filter(
    topic => topic && topic.topic && typeof topic.topic === 'string' && topic.topic.trim() !== ''
  );

  // Extract unique search values (filter out invalid ones too)
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

  // Analyze each topic
  const analyzedTopics = validTopics.map(topic => {
    let matchedInSearches = false;
    let matchedInProfiles = false;

    // Check against keyword searches
    for (const keyword of searchKeywords) {
      if (topicMatchesKeyword(topic.topic, keyword)) {
        matchedInSearches = true;
        break;
      }
    }

    // Check against profile searches
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

  // Calculate match statistics
  const matchedViaKeywords = analyzedTopics.filter(t => t.matchedInSearches).length;
  const matchedViaProfiles = analyzedTopics.filter(t => t.matchedInProfiles).length;
  const totalMatched = analyzedTopics.filter(t => 
    t.matchedInSearches || t.matchedInProfiles
  ).length;

  const matchPercentage = validTopics.length > 0
    ? Math.round((totalMatched / validTopics.length) * 100)
    : 0;

  // Get unmatched topics
  const unmatchedTopics = analyzedTopics
    .filter(t => !t.matchedInSearches && !t.matchedInProfiles)
    .map(t => t.topic);

  // Take top 15 topics (no sorting by weight since it doesn't exist)
  const topTopics = analyzedTopics.slice(0, 15);

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