import { describe, expect, test } from 'bun:test';

import { buildExerciseHistory } from '@/progress/buildExerciseSessions';
import type { ExerciseHistorySet } from '@/types/ExerciseHistory';

let nextSetId = 0;

function historySet(sessionId: number, startedAt: string, weightKilograms: number, repetitions: number) {
  nextSetId += 1;
  const result: ExerciseHistorySet = {
    setId: nextSetId,
    sessionId,
    startedAt,
    workoutName: `Workout ${sessionId}`,
    exerciseName: 'Bench Press',
    exerciseImageUrl: null,
    set: {
      exerciseId: 1,
      trackingType: 'repetitions_and_weight',
      repetitions,
      weightKilograms,
      durationSeconds: null,
      distanceMeters: null,
    },
  };
  return result;
}

describe('buildExerciseHistory', () => {
  const first = historySet(1, '2026-09-10T12:00:00.000Z', 60, 8);
  const secondOfFirst = historySet(1, '2026-09-10T12:00:00.000Z', 60, 6);
  const heavier = historySet(2, '2026-09-20T12:00:00.000Z', 70, 5);
  const history = buildExerciseHistory([first, secondOfFirst, heavier]);

  test('lists sessions newest first with sets written as weight × repetitions', () => {
    expect(history.sessions.map((session) => session.sessionId)).toEqual([2, 1]);
    expect(history.sessions[1].sets.map((set) => set.description)).toEqual(['60 × 8', '60 × 6']);
    expect(history.sessions[0].workoutName).toBe('Workout 2');
  });

  test('marks the record set and its session date', () => {
    expect([...history.recordSetIds]).toEqual([heavier.setId]);
    expect(history.sessions[0].sets[0].isRecord).toBe(true);
    expect(history.sessions[1].sets.some((set) => set.isRecord)).toBe(false);
    expect(history.recordDates).toEqual(['2026-09-20']);
  });

  test('has no records for a single session', () => {
    const single = buildExerciseHistory([first]);
    expect(single.recordSetIds.size).toBe(0);
    expect(single.recordDates).toEqual([]);
  });

  test('exposes the sets for the series with local dates', () => {
    expect(history.seriesSets).toHaveLength(3);
    expect(history.seriesSets[2]).toEqual({ sessionId: 2, date: '2026-09-20', set: heavier.set });
  });
});
