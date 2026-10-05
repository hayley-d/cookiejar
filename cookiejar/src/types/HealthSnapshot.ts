import type { DailyHealth } from '@/health/HealthTypes';

export type HealthSnapshot = DailyHealth & {
  fetchedAt: string;
};
