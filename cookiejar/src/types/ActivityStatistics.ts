import type { ActivityType } from '@/types/ActivityType';

export type ActivityTotals = {
  sessionCount: number;
  distanceMeters: number;
  elevationGainMeters: number;
};

export type ActivityBests = {
  longestDistanceMeters: number | null;
  mostElevationGainMeters: number | null;
  fastestPaceSecondsPerKilometer: number | null;
};

export type ActivityStatistics = {
  activityType: ActivityType;
  thisMonth: ActivityTotals;
  allTime: ActivityTotals;
  bests: ActivityBests;
};
