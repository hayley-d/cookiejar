import { paceForBest } from '@/progress/activityBestRules';
import { activityTypes } from '@/types/ActivityType';
import type { ActivityLog } from '@/types/ActivityLog';
import type { ActivityBests, ActivityStatistics, ActivityTotals } from '@/types/ActivityStatistics';

function sumTotals(logs: readonly ActivityLog[]): ActivityTotals {
  return {
    sessionCount: logs.length,
    distanceMeters: logs.reduce((total, log) => total + (log.distanceMeters ?? 0), 0),
    elevationGainMeters: logs.reduce((total, log) => total + (log.elevationGainMeters ?? 0), 0),
  };
}

function largestPositive(values: readonly (number | null)[]): number | null {
  const positiveValues = values.filter((value): value is number => value !== null && value > 0);
  return positiveValues.length === 0 ? null : Math.max(...positiveValues);
}

function findBests(logs: readonly ActivityLog[]): ActivityBests {
  const paces = logs.map(paceForBest).filter((pace): pace is number => pace !== null);
  return {
    longestDistanceMeters: largestPositive(logs.map((log) => log.distanceMeters)),
    mostElevationGainMeters: largestPositive(logs.map((log) => log.elevationGainMeters)),
    fastestPaceSecondsPerKilometer: paces.length === 0 ? null : Math.min(...paces),
  };
}

function isInMonthOf(startedAt: string, now: Date): boolean {
  const startedDate = new Date(startedAt);
  return startedDate.getFullYear() === now.getFullYear() && startedDate.getMonth() === now.getMonth();
}

export function buildActivityStatistics(logs: readonly ActivityLog[], now: Date): ActivityStatistics[] {
  return activityTypes.flatMap((activityType) => {
    const logsOfType = logs.filter((log) => log.activityType === activityType);
    if (logsOfType.length === 0) {
      return [];
    }
    return [
      {
        activityType,
        thisMonth: sumTotals(logsOfType.filter((log) => isInMonthOf(log.startedAt, now))),
        allTime: sumTotals(logsOfType),
        bests: findBests(logsOfType),
      },
    ];
  });
}
