import { deriveSecondsPerHundredMeters } from '@/swimming/swimPace';
import type { SwimLog } from '@/types/SwimLog';

export const minimumSwimPaceDistanceMeters = 400;

export function swimDistanceForBest(log: SwimLog): number | null {
  return log.distanceMeters > 0 ? log.distanceMeters : null;
}

export function swimPaceForBest(log: SwimLog): number | null {
  if (log.distanceMeters < minimumSwimPaceDistanceMeters) {
    return null;
  }
  return deriveSecondsPerHundredMeters(log.durationSeconds, log.distanceMeters);
}
