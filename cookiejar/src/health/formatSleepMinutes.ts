import { missingHealthValue } from '@/health/formatSteps';

export function formatSleepMinutes(sleepMinutes: number | null): string {
  if (sleepMinutes === null) {
    return missingHealthValue;
  }
  const wholeMinutes = Math.max(0, Math.round(sleepMinutes));
  return `${Math.floor(wholeMinutes / 60)}h ${wholeMinutes % 60}m`;
}
