import { InstagramDataStore } from '@/lib/data/dataStore';

export interface TopItem {
  name: string;
  count: number;
}

export interface EngagementStats {
  mostInteractedAccounts: TopItem[];
  totalInteractions: number;
}

export function analyzeEngagement(store: InstagramDataStore, topN: number = 10): EngagementStats {
  const interactions = new Map<string, number>();
  
  // Count from liked comments
  store.getLikedComments().forEach(comment => {
    const match = comment.link.match(/instagram\.com\/([^\/]+)/);
    if (match) {
      const username = match[1];
      interactions.set(username, (interactions.get(username) || 0) + 1);
    }
  });
  
  // Count from posts viewed
  store.getPostsViewed().forEach(post => {
    if (post.author) {
      interactions.set(post.author, (interactions.get(post.author) || 0) + 1);
    }
  });
  
  const mostInteracted = Array.from(interactions.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
  
  return {
    mostInteractedAccounts: mostInteracted,
    totalInteractions: Array.from(interactions.values()).reduce((sum, count) => sum + count, 0)
  };
}