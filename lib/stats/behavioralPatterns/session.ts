/**
 * Session and Binge Watching Analysis
 * Detects user sessions and binge watching patterns
 */

import { Activity, Session, BingeSession, SESSION_GAP_SECONDS, BINGE_MIN_VIDEOS } from './types';

/**
 * Detect sessions based on activity gaps
 */
export function detectSessions(activities: Activity[]): Session[] {
  if (activities.length === 0) return [];

  const sessions: Session[] = [];
  let currentSession: Activity[] = [activities[0]];

  for (let i = 1; i < activities.length; i++) {
    const timeSinceLastActivity = activities[i].timestamp - activities[i - 1].timestamp;

    if (timeSinceLastActivity <= SESSION_GAP_SECONDS) {
      currentSession.push(activities[i]);
    } else {
      sessions.push(createSession(currentSession));
      currentSession = [activities[i]];
    }
  }

  if (currentSession.length > 0) {
    sessions.push(createSession(currentSession));
  }

  return sessions;
}

/**
 * Create a session object from activities
 */
function createSession(activities: Activity[]): Session {
  const startTime = activities[0].timestamp;
  const endTime = activities[activities.length - 1].timestamp;
  
  return {
    startTime,
    endTime,
    durationSeconds: endTime - startTime,
    activityCount: activities.length,
    activities,
  };
}

/**
 * Calculate session statistics
 */
export function calculateSessionStats(sessions: Session[]) {
  const sessionDurations = sessions.map(s => s.durationSeconds / 60);
  const totalActivitiesCount = sessions.reduce((sum, s) => sum + s.activityCount, 0);

  return {
    totalSessions: sessions.length,
    averageDurationMinutes: sessionDurations.length > 0
      ? Math.round((sessionDurations.reduce((sum, dur) => sum + dur, 0) / sessionDurations.length) * 10) / 10
      : 0,
    longestSessionMinutes: sessionDurations.length > 0
      ? Math.round(Math.max(...sessionDurations) * 10) / 10
      : 0,
    shortestSessionMinutes: sessionDurations.length > 0
      ? Math.round(Math.min(...sessionDurations) * 10) / 10
      : 0,
    totalActivitiesCount,
    averageActivitiesPerSession: sessions.length > 0
      ? Math.round((totalActivitiesCount / sessions.length) * 10) / 10
      : 0,
  };
}

/**
 * Detect binge watching sessions
 */
export function detectBingeWatching(activities: Activity[]): BingeSession[] {
  const bingeSessions: BingeSession[] = [];
  const videoActivities = activities.filter(a => a.type === 'video_watched');

  if (videoActivities.length < BINGE_MIN_VIDEOS) return [];

  let currentBinge: Activity[] = [videoActivities[0]];

  for (let i = 1; i < videoActivities.length; i++) {
    const timeSinceLastVideo = videoActivities[i].timestamp - videoActivities[i - 1].timestamp;

    if (timeSinceLastVideo <= SESSION_GAP_SECONDS) {
      currentBinge.push(videoActivities[i]);
    } else {
      if (currentBinge.length >= BINGE_MIN_VIDEOS) {
        bingeSessions.push(createBingeSession(currentBinge));
      }
      currentBinge = [videoActivities[i]];
    }
  }

  if (currentBinge.length >= BINGE_MIN_VIDEOS) {
    bingeSessions.push(createBingeSession(currentBinge));
  }

  return bingeSessions;
}

/**
 * Create a binge session object
 */
function createBingeSession(videos: Activity[]): BingeSession {
  const startTime = videos[0].timestamp;
  const endTime = videos[videos.length - 1].timestamp;
  const durationSeconds = endTime - startTime;

  return {
    startTime,
    endTime,
    videoCount: videos.length,
    durationMinutes: Math.round(durationSeconds / 60),
  };
}

/**
 * Calculate binge watching statistics
 */
export function calculateBingeStats(bingeSessions: BingeSession[]) {
  const averageBingeVideoCount = bingeSessions.length > 0
    ? bingeSessions.reduce((sum, b) => sum + b.videoCount, 0) / bingeSessions.length
    : 0;
  
  const longestBinge = bingeSessions.length > 0
    ? bingeSessions.reduce((max, b) => b.videoCount > max.videoCount ? b : max, bingeSessions[0])
    : null;

  // NEW: Top 3 binge sessions (sorted by video count)
  const top3Binges = [...bingeSessions]
    .sort((a, b) => b.videoCount - a.videoCount)
    .slice(0, 3)
    .map(b => ({
      ...b,
      midpointTime: Math.round((b.startTime + b.endTime) / 2)
    }));

  return {
    totalBingeSessions: bingeSessions.length,
    longestBingeVideoCount: longestBinge ? longestBinge.videoCount : 0,
    longestBingeDurationMinutes: longestBinge ? longestBinge.durationMinutes : 0,
    averageBingeVideoCount: Math.round(averageBingeVideoCount * 10) / 10,
    bingeSessions,

    // NEW: midpoint of *longest binge*
    longestBingeMidpointTime: longestBinge
      ? Math.round((longestBinge.startTime + longestBinge.endTime) / 2)
      : null,

    // NEW: top 3 binges with midpoint included
    top3BingeSessions: top3Binges,
  };
}
