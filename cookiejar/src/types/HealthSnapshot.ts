export type HealthSnapshot = {
  date: string;
  steps: number | null;
  sleepMinutes: number | null;
  restingHeartRate: number | null;
  fetchedAt: string;
};
