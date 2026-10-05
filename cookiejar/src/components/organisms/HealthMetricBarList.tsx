import { StatBarList } from '@/components/organisms/StatBarList';
import { formatShortDate } from '@/dates/formatShortDate';
import { formatRestingHeartRate } from '@/health/formatRestingHeartRate';
import { formatSleepMinutes } from '@/health/formatSleepMinutes';
import { formatSteps } from '@/health/formatSteps';
import { barFraction, largestValue } from '@/stats/barFraction';
import type { HealthStatsMetric } from '@/stats/parseStatsMetric';
import type { HealthSnapshot } from '@/types/HealthSnapshot';

type HealthMetricBarListProperties = {
  metric: HealthStatsMetric;
  datesNewestFirst: readonly string[];
  snapshotsByDate: ReadonlyMap<string, HealthSnapshot>;
};

type MetricDefinition = {
  readValue: (snapshot: HealthSnapshot) => number | null;
  format: (value: number | null) => string;
};

const metricDefinitions: Record<HealthStatsMetric, MetricDefinition> = {
  steps: { readValue: (snapshot) => snapshot.steps, format: formatSteps },
  sleep: { readValue: (snapshot) => snapshot.sleepMinutes, format: formatSleepMinutes },
  restingHeartRate: { readValue: (snapshot) => snapshot.restingHeartRate, format: formatRestingHeartRate },
};

export function HealthMetricBarList({ metric, datesNewestFirst, snapshotsByDate }: HealthMetricBarListProperties) {
  const { readValue, format } = metricDefinitions[metric];
  const values = datesNewestFirst.map((date) => {
    const snapshot = snapshotsByDate.get(date);
    return snapshot === undefined ? null : readValue(snapshot);
  });
  const maximum = largestValue(values);
  const rows = datesNewestFirst.map((date, index) => ({
    date,
    dateLabel: formatShortDate(date),
    valueText: format(values[index]),
    fraction: barFraction(values[index], maximum),
  }));

  return <StatBarList rows={rows} />;
}
