export type DailyHealth = {
  date: string;
  steps: number | null;
  sleepMinutes: number | null;
  restingHeartRate: number | null;
};

export type HealthAuthorizationOutcome = 'authorized' | 'denied' | 'unavailable';

export type HealthWorkout = {
  uuid: string;
  activityTypeCode: number;
  startDate: Date;
  endDate: Date;
  durationSeconds: number;
  activeKilocalories: number | null;
  sourceName: string;
  bundleIdentifier: string;
};

export type WorkoutHeartRate = {
  averageHeartRate: number | null;
  maximumHeartRate: number | null;
};
