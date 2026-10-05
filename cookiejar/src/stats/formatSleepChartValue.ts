import { formatDuration } from '@/dates/formatDuration';

const secondsPerMinute = 60;

export function formatSleepChartValue(sleepMinutes: number): string {
  return formatDuration(Math.round(sleepMinutes) * secondsPerMinute);
}
