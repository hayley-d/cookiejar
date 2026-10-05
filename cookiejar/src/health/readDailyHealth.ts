import { isHealthDataAvailable, queryStatisticsForQuantity } from '@kingstinct/react-native-healthkit';

import { healthDayRange } from '@/health/healthDayRange';
import type { DailyHealth } from '@/health/HealthTypes';

async function readSteps(date: string, now: Date): Promise<number | null> {
  const { startDate, endDate } = healthDayRange(date, now);
  const statistics = await queryStatisticsForQuantity('HKQuantityTypeIdentifierStepCount', ['cumulativeSum'], {
    filter: { date: { startDate, endDate } },
    unit: 'count',
  });
  return statistics.sumQuantity === undefined ? null : Math.round(statistics.sumQuantity.quantity);
}

export async function readDailyHealth(date: string, now: Date = new Date()): Promise<DailyHealth> {
  if (!isHealthDataAvailable()) {
    throw new Error('Health data is not available on this device');
  }
  return {
    date,
    steps: await readSteps(date, now),
    sleepMinutes: null,
    restingHeartRate: null,
  };
}
