import type { ActivityType } from '@/types/ActivityType';

export type ActivityLog = {
  activityType: ActivityType;
  startedAt: string;
  durationSeconds: number;
  distanceMeters: number | null;
  elevationGainMeters: number | null;
};
