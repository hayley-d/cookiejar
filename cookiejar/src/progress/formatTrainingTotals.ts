import type { TrainingTotals } from '@/types/TrainingTotals';

const secondsPerMinute = 60;
const minutesPerHour = 60;

export function formatTimeTrained(seconds: number): string {
  const totalMinutes = Math.floor(Math.max(0, seconds) / secondsPerMinute);
  const hours = Math.floor(totalMinutes / minutesPerHour);
  const minutes = totalMinutes % minutesPerHour;
  if (hours === 0) {
    return `${minutes} min`;
  }
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

export function formatWholeHoursTrained(seconds: number): string {
  const totalMinutes = Math.floor(Math.max(0, seconds) / secondsPerMinute);
  const hours = Math.floor(totalMinutes / minutesPerHour);
  return hours === 0 ? `${totalMinutes} min` : `${hours} h`;
}

export function formatVolume(volumeKilograms: number): string {
  return `${Math.round(volumeKilograms).toLocaleString('en-US')} kg`;
}

export function describeNewRecordCount(recordCount: number): string {
  return `🏆 ${recordCount} new ${recordCount === 1 ? 'record' : 'records'} this month`;
}

export function describeLifetimeTotals(totals: TrainingTotals): string {
  const workoutLabel = totals.workoutCount === 1 ? 'workout' : 'workouts';
  return `${totals.workoutCount} ${workoutLabel} · ${formatWholeHoursTrained(totals.timeTrainedSeconds)} trained`;
}
