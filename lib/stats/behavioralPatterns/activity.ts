import { DataWrapper } from '../../data/dataWrapper';
import {
  LikedPost,
  LikedComment,
  VideoWatched,
  PostViewed,
  AdViewed,
  ProfileSearch,
  KeywordSearch,
  PlaceSearch
} from '@/types/instagram';
import { Activity } from './types';

/**
 * Collect all activities with timestamps from the data wrapper
 */
export function collectAllActivities(wrapper: DataWrapper): Activity[] {
  const activities: Activity[] = [];

  wrapper.getPostsViewed().forEach((post: PostViewed) => {
    if (post.timestamp > 0) {
      activities.push({
        type: 'post_viewed',
        timestamp: post.timestamp,
        author: post.author,
      });
    }
  });

  wrapper.getVideosWatched().forEach((video: VideoWatched) => {
    if (video.timestamp > 0) {
      activities.push({
        type: 'video_watched',
        timestamp: video.timestamp,
        author: video.author,
      });
    }
  });

  wrapper.getAdsViewed().forEach((ad: AdViewed) => {
    if (ad.timestamp > 0) {
      activities.push({
        type: 'ad_viewed',
        timestamp: ad.timestamp,
        author: ad.author,
      });
    }
  });

  wrapper.getLikedPosts().forEach((like: LikedPost) => {
    if (like.timestamp > 0) {
      activities.push({
        type: 'liked_post',
        timestamp: like.timestamp,
        author: like.author,
      });
    }
  });

  wrapper.getLikedComments().forEach((comment: LikedComment) => {
    if (comment.timestamp > 0) {
      activities.push({
        type: 'liked_comment',
        timestamp: comment.timestamp,
      });
    }
  });

  wrapper.getProfileSearches().forEach((search: ProfileSearch) => {
    if (search.timestamp > 0) {
      activities.push({
        type: 'profile_search',
        timestamp: search.timestamp,
        value: search.author,
      });
    }
  });

  wrapper.getKeywordSearches().forEach((search: KeywordSearch) => {
    if (search.timestamp > 0) {
      activities.push({
        type: 'keyword_search',
        timestamp: search.timestamp,
        value: search.value,
      });
    }
  });

  wrapper.getPlaceSearches().forEach((search: PlaceSearch) => {
    if (search.timestamp > 0) {
      activities.push({
        type: 'place_search',
        timestamp: search.timestamp,
        value: search.value,
      });
    }
  });

  return activities.sort((a, b) => a.timestamp - b.timestamp);
}

export function calculateHourlyDistribution(activities: Activity[]): Record<number, number> {
  const distribution: Record<number, number> = {};
  
  for (let i = 0; i < 24; i++) {
    distribution[i] = 0;
  }

  activities.forEach(activity => {
    const date = new Date(activity.timestamp * 1000);
    const hour = date.getHours();
    distribution[hour]++;
  });

  return distribution;
}

export function calculateDailyDistribution(activities: Activity[]): Record<number, number> {
  const distribution: Record<number, number> = {};
  
  for (let i = 0; i < 7; i++) {
    distribution[i] = 0;
  }

  activities.forEach(activity => {
    const date = new Date(activity.timestamp * 1000);
    const day = date.getDay();
    distribution[day]++;
  });

  return distribution;
}

export function getTopFromDistribution(distribution: Record<number, number>, n: number): number[] {
  return Object.entries(distribution)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, n)
    .map(([key]) => parseInt(key));
}