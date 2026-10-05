import { formatDuration } from '@/dates/formatDuration';
import { missingHealthValue } from '@/health/formatSteps';

export function formatHeartRatePair(averageHeartRate: number | null, maximumHeartRate: number | null): string {
  const average = averageHeartRate === null ? missingHealthValue : String(Math.round(averageHeartRate));
  const maximum = maximumHeartRate === null ? missingHealthValue : String(Math.round(maximumHeartRate));
  if (averageHeartRate === null && maximumHeartRate === null) {
    return missingHealthValue;
  }
  return `${average}/${maximum} bpm`;
}

export function formatKilocalories(kilocalories: number | null): string {
  if (kilocalories === null) {
    return missingHealthValue;
  }
  return `${Math.max(0, Math.round(kilocalories))} kcal`;
}

export function formatWorkoutDuration(durationSeconds: number | null): string {
  if (durationSeconds === null) {
    return missingHealthValue;
  }
  return formatDuration(durationSeconds);
}
