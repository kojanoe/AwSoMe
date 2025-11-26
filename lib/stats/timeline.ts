import { InstagramDataStore } from '@/lib/data/dataStore';

export interface TimelineStats {
  activityByDay: Array<{
    date: string;
    posts: number;
    videos: number;
    searches: number;
  }>;
}

export function analyzeTimeline(store: InstagramDataStore): TimelineStats {
  const activityByDay = new Map<string, { posts: number; videos: number; searches: number }>();
  
  const addToDay = (timestamp: number, type: 'posts' | 'videos' | 'searches') => {
    if (!timestamp) return;
    
    const date = new Date(timestamp * 1000);
    const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!activityByDay.has(dayKey)) {
      activityByDay.set(dayKey, { posts: 0, videos: 0, searches: 0 });
    }
    
    activityByDay.get(dayKey)![type]++;
  };
  
  store.getPostsViewed().forEach(p => addToDay(p.timestamp, 'posts'));
  store.getVideosWatched().forEach(v => addToDay(v.timestamp, 'videos'));
  store.getProfileSearches().forEach(s => addToDay(s.timestamp, 'searches'));
  
  return {
    activityByDay: Array.from(activityByDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, counts]) => ({ date, ...counts }))
  };
}