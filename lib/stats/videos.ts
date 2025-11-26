import { InstagramDataStore } from '@/lib/data/dataStore';

export interface TopItem {
  name: string;
  count: number;
  firstSeen?: Date;
  lastSeen?: Date;
}

export interface VideoStats {
  totalVideos: number;
  topCreators: TopItem[];
  videosByMonth: Array<{ month: string; count: number }>;
}

function getTopItemsWithDates(
  items: Array<{ name: string; timestamp: number }>,
  topN: number = 10
): TopItem[] {
  const itemMap = new Map<string, { count: number; timestamps: number[] }>();
  
  items.forEach(({ name, timestamp }) => {
    if (!name) return;
    
    if (!itemMap.has(name)) {
      itemMap.set(name, { count: 0, timestamps: [] });
    }
    
    const item = itemMap.get(name)!;
    item.count++;
    if (timestamp) {
      item.timestamps.push(timestamp);
    }
  });
  
  return Array.from(itemMap.entries())
    .map(([name, data]) => {
      const sortedTimestamps = data.timestamps.sort((a, b) => a - b);
      return {
        name,
        count: data.count,
        firstSeen: sortedTimestamps[0] ? new Date(sortedTimestamps[0] * 1000) : undefined,
        lastSeen: sortedTimestamps[sortedTimestamps.length - 1] ? new Date(sortedTimestamps[sortedTimestamps.length - 1] * 1000) : undefined
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export function analyzeVideos(store: InstagramDataStore, topN: number = 10): VideoStats {
  const videos = store.getVideosWatched();
  
  const topCreators = getTopItemsWithDates(
    videos.map(v => ({ name: v.author, timestamp: v.timestamp })),
    topN
  );
  
  // Count videos by month
  const videosByMonth = new Map<string, number>();
  videos.forEach(video => {
    if (video.timestamp) {
      const date = new Date(video.timestamp * 1000);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      videosByMonth.set(monthKey, (videosByMonth.get(monthKey) || 0) + 1);
    }
  });
  
  return {
    totalVideos: videos.length,
    topCreators,
    videosByMonth: Array.from(videosByMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }))
  };
}