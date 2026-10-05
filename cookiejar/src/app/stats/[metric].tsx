import { Stack, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/molecules/EmptyState';
import { ProgressBarChart } from '@/components/organisms/ProgressBarChart';
import { ProgressLineChart } from '@/components/organisms/ProgressLineChart';
import { HealthMetricBarList } from '@/components/organisms/HealthMetricBarList';
import { StreakBarList } from '@/components/organisms/StreakBarList';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { addDays } from '@/dates/addDays';
import { datesBetween } from '@/dates/datesBetween';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { useHealthRange } from '@/hooks/useHealthRange';
import { useProfile } from '@/hooks/useProfile';
import { useScheduledWorkouts } from '@/hooks/useScheduledWorkouts';
import { parseStatsMetric, type StatsMetric } from '@/stats/parseStatsMetric';
import { averageOfPoints, healthChartPoints, healthChartUnits } from '@/stats/healthChartPoints';
import { statsDetailDayCount } from '@/stats/statsDetail';

type StatsParameters = {
  metric: string;
};

const metricTitles: Record<StatsMetric, string> = {
  steps: 'Steps',
  sleep: 'Sleep',
  restingHeartRate: 'Resting heart rate',
  streak: 'Workouts',
};

export default function StatsScreen() {
  const { metric: metricParameter } = useLocalSearchParams<StatsParameters>();
  const metric = parseStatsMetric(metricParameter);
  const now = new Date();
  const endDate = toLocalDateString(now);
  const startDate = toLocalDateString(addDays(now, 1 - statsDetailDayCount));
  const { snapshotsByDate } = useHealthRange(startDate, endDate);
  const { dailyStepGoal } = useProfile();
  const scheduledWorkoutsLookup = useScheduledWorkouts(startDate, endDate);

  if (metric === null) {
    return (
      <>
        <Stack.Screen options={{ title: 'Stats' }} />
        <EmptyState nuggie="tired" title="Nothing to show" message="That stat does not exist." />
      </>
    );
  }

  const datesOldestFirst = datesBetween(startDate, endDate);
  const datesNewestFirst = [...datesOldestFirst].reverse();
  const chartPoints = metric === 'streak' ? [] : healthChartPoints(metric, datesOldestFirst, snapshotsByDate);

  return (
    <>
      <Stack.Screen options={{ title: metricTitles[metric] }} />
      <ScrollBox>
        {metric === 'streak' ? (
          <StreakBarList
            datesNewestFirst={datesNewestFirst}
            scheduledWorkoutsByDate={
              scheduledWorkoutsLookup.status === 'ready' ? scheduledWorkoutsLookup.scheduledWorkoutsByDate : null
            }
          />
        ) : (
          <Box gap="medium">
            {chartPoints.length === 0 ? null : metric === 'restingHeartRate' ? (
              <ProgressLineChart
                points={chartPoints}
                unit={healthChartUnits[metric]}
                referenceValue={averageOfPoints(chartPoints)}
              />
            ) : (
              <ProgressBarChart
                points={chartPoints}
                unit={healthChartUnits[metric]}
                referenceValue={metric === 'steps' ? dailyStepGoal : undefined}
              />
            )}
            <HealthMetricBarList
              metric={metric}
              datesNewestFirst={datesNewestFirst}
              snapshotsByDate={snapshotsByDate}
            />
          </Box>
        )}
      </ScrollBox>
    </>
  );
}
