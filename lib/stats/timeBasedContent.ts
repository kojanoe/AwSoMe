import { InstagramDataStore } from '../data/dataStore';
import { Following, ProfileSearch } from '@/types/instagram';

export interface HourlyContentBreakdown {
  hour: number;
  total: number;
  intended: number;
  suggested: number;
  ads: number;
  intentedPercent: number;
  suggestedPercent: number;
  adsPercent: number;
}

export interface DailyContentBreakdown {
  day: number;
  total: number;
  intended: number;
  suggested: number;
  ads: number;
  intentedPercent: number;
  suggestedPercent: number;
  adsPercent: number;
}

export function calculateHourlyContentBreakdown(
  store: InstagramDataStore
): HourlyContentBreakdown[] {
  const postsViewed = store.getPostsViewed();
  const videosWatched = store.getVideosWatched();
  const adsViewed = store.getAdsViewed();
  const following = store.getFollowing();
  const profileSearches = store.getProfileSearches();

  const intendedAuthors = new Set<string>();
  following.forEach((f: Following) => intendedAuthors.add(f.author));
  profileSearches.forEach((s: ProfileSearch) => intendedAuthors.add(s.author));

  const hourlyData: Record<number, { total: number; intended: number; suggested: number; ads: number }> = {};
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = { total: 0, intended: 0, suggested: 0, ads: 0 };
  }

  const adsSet = new Set<string>();
  adsViewed.forEach(ad => {
    adsSet.add(`${ad.author}:${ad.timestamp}`);
  });

  const allContent = [...postsViewed, ...videosWatched, ...adsViewed];

  allContent.forEach(item => {
    if (item.timestamp <= 0) return;

    const date = new Date(item.timestamp * 1000);
    const hour = date.getHours();
    const key = `${item.author}:${item.timestamp}`;

    hourlyData[hour].total++;

    if (adsSet.has(key)) {
      hourlyData[hour].ads++;
    } else if (intendedAuthors.has(item.author)) {
      hourlyData[hour].intended++;
    } else {
      hourlyData[hour].suggested++;
    }
  });

  return Object.entries(hourlyData).map(([hour, data]) => {
    const total = data.total;
    return {
      hour: parseInt(hour),
      total,
      intended: data.intended,
      suggested: data.suggested,
      ads: data.ads,
      intentedPercent: total > 0 ? Math.round((data.intended / total) * 100) : 0,
      suggestedPercent: total > 0 ? Math.round((data.suggested / total) * 100) : 0,
      adsPercent: total > 0 ? Math.round((data.ads / total) * 100) : 0,
    };
  });
}

export function calculateDailyContentBreakdown(
  store: InstagramDataStore
): DailyContentBreakdown[] {
  const postsViewed = store.getPostsViewed();
  const videosWatched = store.getVideosWatched();
  const adsViewed = store.getAdsViewed();
  const following = store.getFollowing();
  const profileSearches = store.getProfileSearches();

  const intendedAuthors = new Set<string>();
  following.forEach((f: Following) => intendedAuthors.add(f.author));
  profileSearches.forEach((s: ProfileSearch) => intendedAuthors.add(s.author));

  const dailyData: Record<number, { total: number; intended: number; suggested: number; ads: number }> = {};
  for (let i = 0; i < 7; i++) {
    dailyData[i] = { total: 0, intended: 0, suggested: 0, ads: 0 };
  }

  const adsSet = new Set<string>();
  adsViewed.forEach(ad => {
    adsSet.add(`${ad.author}:${ad.timestamp}`);
  });

  const allContent = [...postsViewed, ...videosWatched, ...adsViewed];

  allContent.forEach(item => {
    if (item.timestamp <= 0) return;

    const date = new Date(item.timestamp * 1000);
    const day = date.getDay();
    const key = `${item.author}:${item.timestamp}`;

    dailyData[day].total++;

    if (adsSet.has(key)) {
      dailyData[day].ads++;
    } else if (intendedAuthors.has(item.author)) {
      dailyData[day].intended++;
    } else {
      dailyData[day].suggested++;
    }
  });

  return Object.entries(dailyData).map(([day, data]) => {
    const total = data.total;
    return {
      day: parseInt(day),
      total,
      intended: data.intended,
      suggested: data.suggested,
      ads: data.ads,
      intentedPercent: total > 0 ? Math.round((data.intended / total) * 100) : 0,
      suggestedPercent: total > 0 ? Math.round((data.suggested / total) * 100) : 0,
      adsPercent: total > 0 ? Math.round((data.ads / total) * 100) : 0,
    };
  });
}