import type { ActivityType } from '@/types/ActivityType';

export type ActivityLogFormValues = {
  activityType: ActivityType;
  date: string;
  startTime: Date;
  hours: number | null;
  minutes: number | null;
  distanceKilometers: number | null;
  elevationGainMeters: number | null;
  activeKilocalories: number | null;
  averageHeartRate: number | null;
  notes: string;
};

export type ActivityLogFormErrors = {
  duration?: string;
};

const secondsPerMinute = 60;
const secondsPerHour = 3600;
const metersPerKilometer = 1000;

export function activityLogDurationSeconds(values: ActivityLogFormValues): number {
  return (values.hours ?? 0) * secondsPerHour + (values.minutes ?? 0) * secondsPerMinute;
}

export function activityLogDistanceMeters(values: ActivityLogFormValues): number | null {
  return values.distanceKilometers === null ? null : Math.round(values.distanceKilometers * metersPerKilometer);
}

export function validateActivityLogForm(values: ActivityLogFormValues): ActivityLogFormErrors {
  if (activityLogDurationSeconds(values) <= 0) {
    return { duration: 'Enter a duration above zero' };
  }
  return {};
}
