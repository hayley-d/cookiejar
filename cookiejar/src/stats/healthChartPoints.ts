import type { HealthStatsMetric } from '@/stats/parseStatsMetric';
import type { ChartPoint } from '@/types/ChartPoint';
import type { HealthSnapshot } from '@/types/HealthSnapshot';

export const healthChartUnits: Record<HealthStatsMetric, string> = {
  steps: 'steps',
  sleep: 'min',
  restingHeartRate: 'bpm',
};

function readChartValue(metric: HealthStatsMetric, snapshot: HealthSnapshot): number | null {
  if (metric === 'steps') {
    return snapshot.steps;
  }
  if (metric === 'restingHeartRate') {
    return snapshot.restingHeartRate;
  }
  return snapshot.sleepMinutes;
}

export function healthChartPoints(
  metric: HealthStatsMetric,
  datesOldestFirst: readonly string[],
  snapshotsByDate: ReadonlyMap<string, HealthSnapshot>,
): ChartPoint[] {
  const points: ChartPoint[] = [];
  for (const date of datesOldestFirst) {
    const snapshot = snapshotsByDate.get(date);
    const value = snapshot === undefined ? null : readChartValue(metric, snapshot);
    if (value !== null) {
      points.push({ date, value });
    }
  }
  return points;
}

export function averageOfPoints(points: readonly ChartPoint[]): number | undefined {
  if (points.length === 0) {
    return undefined;
  }
  return points.reduce((total, point) => total + point.value, 0) / points.length;
}
