import { derivePaceSecondsPerKilometer } from '@/activities/derivePace';
import type { ActivityLog } from '@/types/ActivityLog';

export const minimumPaceDistanceMeters = 1000;

export function paceForBest(log: ActivityLog): number | null {
  if (log.distanceMeters === null || log.distanceMeters < minimumPaceDistanceMeters) {
    return null;
  }
  return derivePaceSecondsPerKilometer(log.distanceMeters, log.durationSeconds);
}
