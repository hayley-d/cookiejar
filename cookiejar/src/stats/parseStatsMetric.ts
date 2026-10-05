export const statsMetrics = ['steps', 'sleep', 'restingHeartRate', 'streak'] as const;

export type StatsMetric = (typeof statsMetrics)[number];

export type HealthStatsMetric = Exclude<StatsMetric, 'streak'>;

export function parseStatsMetric(value: string | undefined): StatsMetric | null {
  return statsMetrics.find((metric) => metric === value) ?? null;
}
