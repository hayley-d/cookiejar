import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { toLocalDateString } from '@/dates/toLocalDateString';

function datesBeforeToday(snapshot: CoachSnapshot, dayCount: number, firstOffset: number): string[] {
  const today = parseLocalDateString(snapshot.today);
  return Array.from({ length: dayCount }, (_, index) => toLocalDateString(addDays(today, -(firstOffset + index))));
}

function averageOf(values: readonly number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function lastNightSleepMinutes(snapshot: CoachSnapshot): number | null {
  return (
    snapshot.healthLastFourteenDays.find((healthSnapshot) => healthSnapshot.date === snapshot.today)?.sleepMinutes ??
    null
  );
}

export function todayRestingHeartRate(snapshot: CoachSnapshot): number | null {
  return (
    snapshot.healthLastFourteenDays.find((healthSnapshot) => healthSnapshot.date === snapshot.today)
      ?.restingHeartRate ?? null
  );
}

export function averageSleepMinutes(snapshot: CoachSnapshot, nightCount: number): number | null {
  const dates = new Set(datesBeforeToday(snapshot, nightCount, 0));
  const values: number[] = [];
  for (const healthSnapshot of snapshot.healthLastFourteenDays) {
    if (dates.has(healthSnapshot.date) && healthSnapshot.sleepMinutes !== null) {
      values.push(healthSnapshot.sleepMinutes);
    }
  }
  return averageOf(values);
}

export function averageRestingHeartRateBeforeToday(snapshot: CoachSnapshot, dayCount: number): number | null {
  const dates = new Set(datesBeforeToday(snapshot, dayCount, 1));
  const values: number[] = [];
  for (const healthSnapshot of snapshot.healthLastFourteenDays) {
    if (dates.has(healthSnapshot.date) && healthSnapshot.restingHeartRate !== null) {
      values.push(healthSnapshot.restingHeartRate);
    }
  }
  return averageOf(values);
}
