import { elapsedSecondsBetween } from '@/sessions/calculateSessionTotals';

const secondsPerMinute = 60;

export function elapsedWholeMinutes(startedAt: string, now: Date): number {
  return Math.floor(elapsedSecondsBetween(startedAt, now) / secondsPerMinute);
}

export function describeActiveSessionBanner(startedAt: string, now: Date): string {
  return `Workout in progress · ${elapsedWholeMinutes(startedAt, now)} min — Resume`;
}
