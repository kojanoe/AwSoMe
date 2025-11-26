import { InstagramDataStore } from '@/lib/data/dataStore';

export interface TopItem {
  name: string;
  count: number;
  firstSeen?: Date;
  lastSeen?: Date;
}

export interface FollowerStats {
  summary: {
    totalPosts: number;
    followedCount: number;
    notFollowedCount: number;
    followedPercentage: number;
    notFollowedPercentage: number;
  };
  topFollowed: TopItem[];
  topNotFollowed: TopItem[];
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

export function analyzeFollowers(store: InstagramDataStore, topN: number = 10): FollowerStats {
  const { followed, notFollowed } = store.getCategorizedPosts();
  
  const totalPosts = store.getPostsViewed().length;
  const followedCount = followed.length;
  const notFollowedCount = notFollowed.length;
  
  return {
    summary: {
      totalPosts,
      followedCount,
      notFollowedCount,
      followedPercentage: totalPosts > 0 ? (followedCount / totalPosts) * 100 : 0,
      notFollowedPercentage: totalPosts > 0 ? (notFollowedCount / totalPosts) * 100 : 0
    },
    topFollowed: getTopItemsWithDates(
      followed.map(p => ({ name: p.author, timestamp: p.timestamp })),
      topN
    ),
    topNotFollowed: getTopItemsWithDates(
      notFollowed.map(p => ({ name: p.author, timestamp: p.timestamp })),
      topN
    )
  };
}