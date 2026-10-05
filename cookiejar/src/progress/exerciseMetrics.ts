import { formatDuration } from '@/dates/formatDuration';
import type { TrackingType } from '@/types/TrackingType';
import { formatDistance } from '@/workouts/describeTargetSets';

export type ExerciseMetric =
  'estimatedOneRepMax' | 'heaviestWeight' | 'volume' | 'mostRepetitions' | 'longestDuration' | 'longestDistance';

export const exerciseMetricLabels: Record<ExerciseMetric, string> = {
  estimatedOneRepMax: 'Estimated 1RM',
  heaviestWeight: 'Heaviest weight',
  volume: 'Volume',
  mostRepetitions: 'Most reps',
  longestDuration: 'Longest time',
  longestDistance: 'Longest distance',
};

export const exerciseMetricUnits: Record<ExerciseMetric, string> = {
  estimatedOneRepMax: 'kg',
  heaviestWeight: 'kg',
  volume: 'kg',
  mostRepetitions: 'reps',
  longestDuration: 's',
  longestDistance: 'm',
};

export const exerciseMetricValueFormatters: Partial<Record<ExerciseMetric, (value: number) => string>> = {
  longestDuration: formatDuration,
  longestDistance: formatDistance,
};

export const exerciseMetricTrackingTypes: Record<ExerciseMetric, TrackingType> = {
  estimatedOneRepMax: 'repetitions_and_weight',
  heaviestWeight: 'repetitions_and_weight',
  volume: 'repetitions_and_weight',
  mostRepetitions: 'repetitions',
  longestDuration: 'duration',
  longestDistance: 'distance',
};

const metricsByTrackingType: Record<TrackingType, readonly ExerciseMetric[]> = {
  repetitions_and_weight: ['estimatedOneRepMax', 'heaviestWeight', 'volume'],
  repetitions: ['mostRepetitions'],
  duration: ['longestDuration'],
  distance: ['longestDistance'],
};

export function metricsForTrackingType(trackingType: TrackingType): readonly ExerciseMetric[] {
  return metricsByTrackingType[trackingType];
}

export function isColumnMetric(metric: ExerciseMetric): boolean {
  return metric === 'volume';
}
