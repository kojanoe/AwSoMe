import { InstagramDataStore } from '@/lib/data/dataStore';

export interface TopItem {
  name: string;
  count: number;
}

export interface SearchStats {
  topProfileSearches: TopItem[];
  topKeywordSearches: TopItem[];
  topPlaceSearches: TopItem[];
  totalSearches: number;
}

function getTopItems(items: string[], topN: number = 10): TopItem[] {
  const counts = new Map<string, number>();
  
  items.forEach(item => {
    if (item) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }
  });
  
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export function analyzeSearches(store: InstagramDataStore, topN: number = 10): SearchStats {
  return {
    topProfileSearches: getTopItems(
      store.getProfileSearches().map(s => s.author),
      topN
    ),
    topKeywordSearches: getTopItems(
      store.getKeywordSearches().map(s => s.value),
      topN
    ),
    topPlaceSearches: getTopItems(
      store.getPlaceSearches().map(s => s.value),
      topN
    ),
    totalSearches: store.getAllSearches().length
  };
}