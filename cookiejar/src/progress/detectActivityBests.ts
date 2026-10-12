import { paceForBest } from '@/progress/activityBestRules';
import { activityTypeLabels, type ActivityType } from '@/types/ActivityType';
import type { ActivityLog } from '@/types/ActivityLog';

export type ActivityBestKind = 'longestDistance' | 'mostElevation' | 'fastestPace';

function exceedsEarlierValues(value: number | null, earlierValues: readonly (number | null)[]): boolean {
  if (value === null || value <= 0) {
    return false;
  }
  return earlierValues.every((earlierValue) => earlierValue === null || value > earlierValue);
}

export function detectActivityBests(log: ActivityLog, earlierLogs: readonly ActivityLog[]): ActivityBestKind[] {
  const earlierLogsOfSameType = earlierLogs.filter((earlierLog) => earlierLog.activityType === log.activityType);
  if (earlierLogsOfSameType.length === 0) {
    return [];
  }
  const bests: ActivityBestKind[] = [];
  if (
    exceedsEarlierValues(
      log.distanceMeters,
      earlierLogsOfSameType.map((earlierLog) => earlierLog.distanceMeters),
    )
  ) {
    bests.push('longestDistance');
  }
  if (
    exceedsEarlierValues(
      log.elevationGainMeters,
      earlierLogsOfSameType.map((earlierLog) => earlierLog.elevationGainMeters),
    )
  ) {
    bests.push('mostElevation');
  }
  const pace = paceForBest(log);
  const earlierPaces = earlierLogsOfSameType.map(paceForBest);
  if (pace !== null && earlierPaces.every((earlierPace) => earlierPace === null || pace < earlierPace)) {
    bests.push('fastestPace');
  }
  return bests;
}

export function describeActivityBest(kind: ActivityBestKind, activityType: ActivityType): string {
  if (kind === 'longestDistance') {
    return `Longest ${activityTypeLabels[activityType].toLowerCase()}`;
  }
  return kind === 'mostElevation' ? 'Most elevation' : 'Fastest pace';
}

export function describeActivityBests(kinds: readonly ActivityBestKind[], activityType: ActivityType | null): string[] {
  if (activityType === null) {
    return [];
  }
  return kinds.map((kind) => describeActivityBest(kind, activityType));
}
