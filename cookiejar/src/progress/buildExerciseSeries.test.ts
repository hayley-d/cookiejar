import { describe, expect, test } from 'bun:test';

import { buildExerciseSeries, type ExerciseSeriesSet } from '@/progress/buildExerciseSeries';
import type { CompletedSet } from '@/progress/detectPersonalRecords';

const emptySet: CompletedSet = {
  exerciseId: 1,
  trackingType: 'repetitions_and_weight',
  repetitions: null,
  weightKilograms: null,
  durationSeconds: null,
  distanceMeters: null,
};

function weighted(sessionId: number, date: string, weightKilograms: number, repetitions: number): ExerciseSeriesSet {
  return { sessionId, date, set: { ...emptySet, weightKilograms, repetitions } };
}

function other(sessionId: number, date: string, set: Partial<CompletedSet>): ExerciseSeriesSet {
  return { sessionId, date, set: { ...emptySet, ...set } };
}

describe('buildExerciseSeries', () => {
  test('gives no points for no sets', () => {
    expect(buildExerciseSeries([], 'volume')).toEqual([]);
  });

  test('estimated 1RM keeps the best set of each session, oldest first', () => {
    const sets = [
      weighted(2, '2026-09-20', 70, 5),
      weighted(1, '2026-09-10', 60, 5),
      weighted(1, '2026-09-10', 62.5, 3),
    ];
    expect(buildExerciseSeries(sets, 'estimatedOneRepMax')).toEqual([
      { date: '2026-09-10', value: 70 },
      { date: '2026-09-20', value: 81.7 },
    ]);
  });

  test('estimated 1RM ignores sets above 12 repetitions and gives no point for such a session', () => {
    const sets = [weighted(1, '2026-09-10', 40, 15), weighted(2, '2026-09-12', 40, 12)];
    expect(buildExerciseSeries(sets, 'estimatedOneRepMax')).toEqual([{ date: '2026-09-12', value: 56 }]);
  });

  test('heaviest weight counts sets of any repetition count', () => {
    const sets = [weighted(1, '2026-09-10', 40, 15), weighted(1, '2026-09-10', 30, 3)];
    expect(buildExerciseSeries(sets, 'heaviestWeight')).toEqual([{ date: '2026-09-10', value: 40 }]);
  });

  test('volume sums weight times repetitions per session', () => {
    const sets = [
      weighted(1, '2026-09-10', 60, 8),
      weighted(1, '2026-09-10', 60, 6),
      weighted(2, '2026-09-17', 50, 10),
    ];
    expect(buildExerciseSeries(sets, 'volume')).toEqual([
      { date: '2026-09-10', value: 840 },
      { date: '2026-09-17', value: 500 },
    ]);
  });

  test('keeps the best value when two sessions share a date', () => {
    const sets = [weighted(1, '2026-09-10', 60, 8), weighted(2, '2026-09-10', 80, 8), weighted(3, '2026-09-10', 20, 8)];
    expect(buildExerciseSeries(sets, 'volume')).toEqual([{ date: '2026-09-10', value: 640 }]);
    expect(buildExerciseSeries(sets, 'heaviestWeight')).toEqual([{ date: '2026-09-10', value: 80 }]);
  });

  test('ignores weighted sets with no weight or repetitions', () => {
    const sets = [other(1, '2026-09-10', { repetitions: 5 }), other(2, '2026-09-11', { weightKilograms: 50 })];
    expect(buildExerciseSeries(sets, 'volume')).toEqual([]);
    expect(buildExerciseSeries(sets, 'heaviestWeight')).toEqual([]);
  });

  test('most reps, longest time and longest distance take the largest value', () => {
    const repetitionSets = [
      other(1, '2026-09-10', { trackingType: 'repetitions', repetitions: 12 }),
      other(1, '2026-09-10', { trackingType: 'repetitions', repetitions: 15 }),
    ];
    expect(buildExerciseSeries(repetitionSets, 'mostRepetitions')).toEqual([{ date: '2026-09-10', value: 15 }]);
    const durationSets = [
      other(1, '2026-09-10', { trackingType: 'duration', durationSeconds: 45 }),
      other(1, '2026-09-10', { trackingType: 'duration', durationSeconds: 60 }),
    ];
    expect(buildExerciseSeries(durationSets, 'longestDuration')).toEqual([{ date: '2026-09-10', value: 60 }]);
    const distanceSets = [other(1, '2026-09-10', { trackingType: 'distance', distanceMeters: 5000 })];
    expect(buildExerciseSeries(distanceSets, 'longestDistance')).toEqual([{ date: '2026-09-10', value: 5000 }]);
  });

  test('ignores sets recorded with another tracking type', () => {
    const sets = [
      weighted(1, '2026-09-10', 60, 8),
      other(2, '2026-09-12', { trackingType: 'repetitions', repetitions: 20 }),
    ];
    expect(buildExerciseSeries(sets, 'mostRepetitions')).toEqual([{ date: '2026-09-12', value: 20 }]);
    expect(buildExerciseSeries(sets, 'volume')).toEqual([{ date: '2026-09-10', value: 480 }]);
    expect(buildExerciseSeries(sets, 'longestDuration')).toEqual([]);
  });
});
