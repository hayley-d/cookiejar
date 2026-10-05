export type DailyHealth = {
  date: string;
  steps: number | null;
  sleepMinutes: number | null;
  restingHeartRate: number | null;
};

export type HealthAuthorizationOutcome = 'authorized' | 'denied' | 'unavailable';
