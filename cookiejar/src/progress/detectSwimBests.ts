import { swimDistanceForBest, swimPaceForBest } from '@/progress/swimBestRules';
import type { SwimLog } from '@/types/SwimLog';

export type SwimBestKind = 'longestSwim' | 'fastestPace';

export function detectSwimBests(log: SwimLog, earlierLogs: readonly SwimLog[]): SwimBestKind[] {
  const bests: SwimBestKind[] = [];
  const distance = swimDistanceForBest(log);
  const recordedEarlierDistances = earlierLogs
    .map(swimDistanceForBest)
    .filter((earlierDistance): earlierDistance is number => earlierDistance !== null);
  if (
    distance !== null &&
    recordedEarlierDistances.length > 0 &&
    recordedEarlierDistances.every((earlierDistance) => distance > earlierDistance)
  ) {
    bests.push('longestSwim');
  }
  const pace = swimPaceForBest(log);
  const recordedEarlierPaces = earlierLogs
    .map(swimPaceForBest)
    .filter((earlierPace): earlierPace is number => earlierPace !== null);
  if (
    pace !== null &&
    recordedEarlierPaces.length > 0 &&
    recordedEarlierPaces.every((earlierPace) => pace < earlierPace)
  ) {
    bests.push('fastestPace');
  }
  return bests;
}

export function describeSwimBest(kind: SwimBestKind): string {
  return kind === 'longestSwim' ? 'Longest swim' : 'Fastest pace';
}

export function describeSwimBests(kinds: readonly SwimBestKind[]): string[] {
  return kinds.map(describeSwimBest);
}
