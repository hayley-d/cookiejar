import {
  estimateOneRepMax,
  isWeightedSet,
  maximumRepetitionsForOneRepMaxEstimate,
  type CompletedSet,
} from '@/progress/detectPersonalRecords';
import { exerciseMetricTrackingTypes, type ExerciseMetric } from '@/progress/exerciseMetrics';
import type { ChartPoint } from '@/types/ChartPoint';

export type ExerciseSeriesSet = {
  sessionId: number;
  date: string;
  set: CompletedSet;
};

const decimalPlacesFactor = 10;

function roundToOneDecimalPlace(value: number): number {
  return Math.round(value * decimalPlacesFactor) / decimalPlacesFactor;
}

function setValues(metric: ExerciseMetric, sets: readonly CompletedSet[]): number[] {
  switch (metric) {
    case 'estimatedOneRepMax':
      return sets
        .filter(isWeightedSet)
        .filter((set) => set.repetitions <= maximumRepetitionsForOneRepMaxEstimate)
        .map((set) => roundToOneDecimalPlace(estimateOneRepMax(set.weightKilograms, set.repetitions)));
    case 'heaviestWeight':
      return sets.filter(isWeightedSet).map((set) => set.weightKilograms);
    case 'volume': {
      const weightedSets = sets.filter(isWeightedSet);
      return weightedSets.length === 0
        ? []
        : [
            roundToOneDecimalPlace(
              weightedSets.reduce((total, set) => total + set.weightKilograms * set.repetitions, 0),
            ),
          ];
    }
    case 'mostRepetitions':
      return sets.flatMap((set) => (set.repetitions === null ? [] : [set.repetitions]));
    case 'longestDuration':
      return sets.flatMap((set) => (set.durationSeconds === null ? [] : [set.durationSeconds]));
    case 'longestDistance':
      return sets.flatMap((set) => (set.distanceMeters === null ? [] : [set.distanceMeters]));
  }
}

export function buildExerciseSeries(sets: readonly ExerciseSeriesSet[], metric: ExerciseMetric): ChartPoint[] {
  const metricTrackingType = exerciseMetricTrackingTypes[metric];
  const setsBySession = new Map<number, { date: string; sets: CompletedSet[] }>();
  for (const { sessionId, date, set } of sets) {
    if (set.trackingType !== metricTrackingType) {
      continue;
    }
    const session = setsBySession.get(sessionId);
    if (session === undefined) {
      setsBySession.set(sessionId, { date, sets: [set] });
    } else {
      session.sets.push(set);
    }
  }

  const bestValueByDate = new Map<string, number>();
  for (const session of setsBySession.values()) {
    const values = setValues(metric, session.sets);
    if (values.length === 0) {
      continue;
    }
    const sessionValue = Math.max(...values);
    const bestSoFar = bestValueByDate.get(session.date);
    if (bestSoFar === undefined || sessionValue > bestSoFar) {
      bestValueByDate.set(session.date, sessionValue);
    }
  }

  return [...bestValueByDate.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((first, second) => (first.date < second.date ? -1 : first.date > second.date ? 1 : 0));
}
