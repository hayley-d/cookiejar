import type { SwimPoolLength } from '@/types/SwimPoolLength';

const shortPresetLimitMeters = 100;
const longPresetMeters = [200, 400, 800];

export function swimDistancePresets(poolLengthMeters: SwimPoolLength): number[] {
  const shortPresets: number[] = [];
  for (let distanceMeters = poolLengthMeters; distanceMeters <= shortPresetLimitMeters; distanceMeters += poolLengthMeters) {
    shortPresets.push(distanceMeters);
  }
  return [...shortPresets, ...longPresetMeters];
}
