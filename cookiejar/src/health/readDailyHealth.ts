import {
  isHealthDataAvailable,
  queryCategorySamples,
  queryQuantitySamples,
  queryStatisticsForQuantity,
} from '@kingstinct/react-native-healthkit';

import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { computeSleepMinutes } from '@/health/computeSleepMinutes';
import { healthDayRange } from '@/health/healthDayRange';
import { healthSleepRange } from '@/health/healthSleepRange';
import type { DailyHealth } from '@/health/HealthTypes';
import { pickRestingHeartRate } from '@/health/pickRestingHeartRate';

async function readSteps(date: string, now: Date): Promise<number | null> {
  const { startDate, endDate } = healthDayRange(date, now);
  const statistics = await queryStatisticsForQuantity('HKQuantityTypeIdentifierStepCount', ['cumulativeSum'], {
    filter: { date: { startDate, endDate } },
    unit: 'count',
  });
  return statistics.sumQuantity === undefined ? null : Math.round(statistics.sumQuantity.quantity);
}

async function readSleepMinutes(date: string): Promise<number | null> {
  const { startDate, endDate } = healthSleepRange(date);
  const samples = await queryCategorySamples('HKCategoryTypeIdentifierSleepAnalysis', {
    limit: 0,
    filter: { date: { startDate, endDate } },
  });
  return computeSleepMinutes(
    samples.map((sample) => ({
      startDate: sample.startDate,
      endDate: sample.endDate,
      stageValue: Number(sample.value),
      sourceName: sample.sourceRevision?.source.name ?? '',
      bundleIdentifier: sample.sourceRevision?.source.bundleIdentifier ?? '',
    })),
  );
}

async function readRestingHeartRate(date: string): Promise<number | null> {
  const dayStart = parseLocalDateString(date);
  const dayEnd = addDays(dayStart, 1);
  const samples = await queryQuantitySamples('HKQuantityTypeIdentifierRestingHeartRate', {
    limit: 0,
    unit: 'count/min',
    ascending: false,
    filter: { date: { startDate: dayStart, endDate: dayEnd } },
  });
  return pickRestingHeartRate(
    samples.map((sample) => ({ startDate: sample.startDate, beatsPerMinute: sample.quantity })),
    dayStart,
    dayEnd,
  );
}

export async function readDailyHealth(date: string, now: Date = new Date()): Promise<DailyHealth> {
  if (!isHealthDataAvailable()) {
    throw new Error('Health data is not available on this device');
  }
  return {
    date,
    steps: await readSteps(date, now),
    sleepMinutes: await readSleepMinutes(date),
    restingHeartRate: await readRestingHeartRate(date),
  };
}
