import { Stack, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/molecules/EmptyState';
import { StatSummaryCard } from '@/components/molecules/StatSummaryCard';
import { ProgressBarChart } from '@/components/organisms/ProgressBarChart';
import { ProgressLineChart } from '@/components/organisms/ProgressLineChart';
import { StatDayList } from '@/components/organisms/StatDayList';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { addDays } from '@/dates/addDays';
import { datesBetween } from '@/dates/datesBetween';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { useHealthRange } from '@/hooks/useHealthRange';
import { useProfile } from '@/hooks/useProfile';
import { useScheduledWorkouts } from '@/hooks/useScheduledWorkouts';
import { parseStatsMetric, type StatsMetric } from '@/stats/parseStatsMetric';
import { averageOfPoints, healthChartPoints, healthChartUnits } from '@/stats/healthChartPoints';
import { formatSleepChartValue } from '@/stats/formatSleepChartValue';
import { describeHealthStatDays, describeStreakStatDays, healthMetricValues } from '@/stats/describeStatDays';
import { summarizeHealthMetric, summarizeStreakDays } from '@/stats/summarizeStatDays';
import { statsDetailDayCount } from '@/stats/statsDetail';

type StatsParameters = {
  metric: string;
};

const metricValueFormatters: Partial<Record<StatsMetric, (value: number) => string>> = {
  sleep: formatSleepChartValue,
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
  const { dailyStepGoal, isLoaded } = useProfile();
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

  if (metric === 'streak') {
    const statDays = describeStreakStatDays(
      datesNewestFirst,
      scheduledWorkoutsLookup.status === 'ready' ? scheduledWorkoutsLookup.scheduledWorkoutsByDate : null,
      endDate,
    );
    return (
      <>
        <Stack.Screen options={{ title: metricTitles[metric] }} />
        <ScrollBox>
          {scheduledWorkoutsLookup.status === 'ready' ? <StatSummaryCard items={summarizeStreakDays(statDays)} /> : null}
          <StatDayList statDays={statDays} />
        </ScrollBox>
      </>
    );
  }

  const chartPoints = healthChartPoints(metric, datesOldestFirst, snapshotsByDate);
  const summaryItems = summarizeHealthMetric(
    metric,
    datesNewestFirst,
    healthMetricValues(metric, datesNewestFirst, snapshotsByDate),
    dailyStepGoal,
  );

  return (
    <>
      <Stack.Screen options={{ title: metricTitles[metric] }} />
      <ScrollBox>
        {summaryItems.length === 0 ? null : <StatSummaryCard items={summaryItems} />}
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
            formatValue={metricValueFormatters[metric]}
            referenceValue={metric === 'steps' && isLoaded ? dailyStepGoal : undefined}
          />
        )}
        <StatDayList statDays={describeHealthStatDays(metric, datesNewestFirst, snapshotsByDate, dailyStepGoal)} />
      </ScrollBox>
    </>
  );
}
