import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { EmptyState } from '@/components/molecules/EmptyState';
import { RangeSwitcher } from '@/components/molecules/RangeSwitcher';
import { SegmentedControl } from '@/components/molecules/SegmentedControl';
import { ExerciseHistoryList } from '@/components/organisms/ExerciseHistoryList';
import { ProgressBarChart } from '@/components/organisms/ProgressBarChart';
import { ProgressLineChart } from '@/components/organisms/ProgressLineChart';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { useExerciseHistory } from '@/hooks/useExerciseHistory';
import { buildExerciseSeries } from '@/progress/buildExerciseSeries';
import {
  exerciseMetricLabels,
  exerciseMetricUnits,
  isColumnMetric,
  metricsForTrackingType,
  type ExerciseMetric,
} from '@/progress/exerciseMetrics';
import { filterPointsToRange, type ProgressRange } from '@/progress/progressRanges';

const exerciseRanges = ['threeMonths', 'sixMonths', 'oneYear', 'all'] as const;

export default function ExerciseHistoryScreen() {
  const { exerciseId: exerciseIdParameter } = useLocalSearchParams<{ exerciseId: string }>();
  const exerciseId = Number(exerciseIdParameter);
  const { exercise, sessions, recordDates, seriesSets, hasLoadFailed } = useExerciseHistory(exerciseId);
  const [selectedMetric, setSelectedMetric] = useState<ExerciseMetric | null>(null);
  const [selectedRange, setSelectedRange] = useState<ProgressRange>('all');

  const metrics = exercise === null ? [] : metricsForTrackingType(exercise.defaultTrackingType);
  const metric = selectedMetric !== null && metrics.includes(selectedMetric) ? selectedMetric : metrics[0];
  const today = toLocalDateString(new Date());
  const points =
    seriesSets === null || metric === undefined
      ? []
      : filterPointsToRange(buildExerciseSeries(seriesSets, metric), selectedRange, today);

  if (sessions === null || recordDates === null) {
    return hasLoadFailed ? (
      <EmptyState title="Could not load history" message="Something went wrong. Please try again." />
    ) : null;
  }

  if (exercise === null || metric === undefined) {
    return <EmptyState title="Exercise not found" message="This exercise no longer exists." />;
  }

  const unit = exerciseMetricUnits[metric];

  return (
    <ScrollBox>
      <Stack.Screen options={{ title: exercise.name }} />
      <Box gap="medium">
        {metrics.length > 1 ? (
          <SegmentedControl
            segments={metrics.map((candidate) => ({ value: candidate, label: exerciseMetricLabels[candidate] }))}
            selectedValue={metric}
            onSelect={setSelectedMetric}
          />
        ) : null}
        <Typography variant="heading">{exerciseMetricLabels[metric]}</Typography>
        <RangeSwitcher ranges={exerciseRanges} selectedRange={selectedRange} onSelect={setSelectedRange} />
        {points.length === 0 ? (
          <Typography variant="body" color="textSecondary">
            No sessions in this range
          </Typography>
        ) : isColumnMetric(metric) ? (
          <ProgressBarChart points={points} unit={unit} />
        ) : (
          <ProgressLineChart points={points} unit={unit} emphasisedDates={recordDates} />
        )}
      </Box>
      <Typography variant="heading">Sessions</Typography>
      <ExerciseHistoryList sessions={sessions} />
    </ScrollBox>
  );
}
