import type { HealthSnapshot } from '@/types/HealthSnapshot';

export type RestingHeartRateReading = {
  beatsPerMinute: number;
  date: string;
};

export function latestRestingHeartRate(
  todaySnapshot: HealthSnapshot | null,
  previousDatesOldestFirst: readonly string[],
  previousSnapshotsByDate: ReadonlyMap<string, HealthSnapshot>,
): RestingHeartRateReading | null {
  if (todaySnapshot !== null && todaySnapshot.restingHeartRate !== null) {
    return { beatsPerMinute: todaySnapshot.restingHeartRate, date: todaySnapshot.date };
  }
  for (let index = previousDatesOldestFirst.length - 1; index >= 0; index -= 1) {
    const date = previousDatesOldestFirst[index];
    const beatsPerMinute = previousSnapshotsByDate.get(date)?.restingHeartRate ?? null;
    if (beatsPerMinute !== null) {
      return { beatsPerMinute, date };
    }
  }
  return null;
}
