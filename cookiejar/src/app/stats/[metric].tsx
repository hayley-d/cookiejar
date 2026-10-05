import { Stack, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/molecules/EmptyState';
import { HealthMetricBarList } from '@/components/organisms/HealthMetricBarList';
import { StreakBarList } from '@/components/organisms/StreakBarList';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { addDays } from '@/dates/addDays';
import { datesBetween } from '@/dates/datesBetween';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { parseStatsMetric, type StatsMetric } from '@/stats/parseStatsMetric';

const detailDayCount = 14;

type StatsParameters = {
  metric: string;
};

const metricTitles: Record<StatsMetric, string> = {
  steps: 'Steps',
  sleep: 'Sleep',
  restingHeartRate: 'Resting heart rate',
  streak: 'This week',
};

export default function StatsScreen() {
  const { metric: metricParameter } = useLocalSearchParams<StatsParameters>();
  const metric = parseStatsMetric(metricParameter);

  if (metric === null) {
    return (
      <>
        <Stack.Screen options={{ title: 'Stats' }} />
        <EmptyState nuggie="tired" title="Nothing to show" message="That stat does not exist." />
      </>
    );
  }

  const now = new Date();
  const endDate = toLocalDateString(now);
  const startDate = toLocalDateString(addDays(now, 1 - detailDayCount));
  const datesNewestFirst = datesBetween(startDate, endDate).reverse();

  return (
    <>
      <Stack.Screen options={{ title: metricTitles[metric] }} />
      <ScrollBox>
        {metric === 'streak' ? (
          <StreakBarList startDate={startDate} endDate={endDate} datesNewestFirst={datesNewestFirst} />
        ) : (
          <HealthMetricBarList
            metric={metric}
            startDate={startDate}
            endDate={endDate}
            datesNewestFirst={datesNewestFirst}
          />
        )}
      </ScrollBox>
    </>
  );
}
