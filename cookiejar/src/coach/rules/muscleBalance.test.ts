import { describe, expect, test } from 'bun:test';

import type { FinishedSessionWithSets } from '@/coach/CoachSnapshot';
import { createCoachSnapshot } from '@/coach/coachSnapshotFixture';
import { muscleBalance, muscleBalancePriority } from '@/coach/rules/muscleBalance';
import type { BodyPart } from '@/types/BodyPart';
import type { Exercise } from '@/types/Exercise';

const exerciseBodyParts: [number, BodyPart][] = [
  [1, 'chest'],
  [2, 'shoulders'],
  [3, 'triceps'],
  [4, 'back'],
  [5, 'biceps'],
  [6, 'quadriceps'],
  [7, 'hamstrings'],
  [8, 'glutes'],
  [9, 'core'],
  [10, 'calves'],
];

const exercisesById = new Map(
  exerciseBodyParts.map(([id, bodyPart]) => [id, { id, name: `Exercise ${id}`, bodyPart } as Exercise]),
);

function setsFor(exerciseId: number, count: number): FinishedSessionWithSets['sets'] {
  return Array.from({ length: count }, () => ({
    exerciseId,
    trackingType: 'repetitions_and_weight' as const,
    repetitions: 8,
    weightKilograms: 50,
    durationSeconds: null,
    distanceMeters: null,
  }));
}

function sessionWith(date: Date, counts: [number, number][]): FinishedSessionWithSets {
  return {
    sessionId: date.getTime(),
    startedAt: date.toISOString(),
    workoutName: 'Session',
    sets: counts.flatMap(([exerciseId, count]) => setsFor(exerciseId, count)),
  };
}

const recentDate = new Date(2026, 9, 5, 18, 0);

function insightsFor(counts: [number, number][], date: Date = recentDate) {
  return muscleBalance(
    createCoachSnapshot({
      exercisesById,
      sessionsLastTwelveWeeks: [sessionWith(date, counts)],
    }),
  );
}

const balancedWithCore: [number, number][] = [[9, 1]];

describe('muscleBalance push and pull', () => {
  test('too little pull fires for the improvement topic with a back action', () => {
    const insights = insightsFor([[1, 8], [4, 4], ...balancedWithCore]);
    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({
      ruleIdentifier: 'muscleBalance',
      topics: ['improvement'],
      priority: muscleBalancePriority,
      nuggie: 'analytics',
      action: { destination: { screen: 'exerciseLibrary', bodyPart: 'back' } },
    });
    expect(muscleBalancePriority).toBe(45);
  });

  test('exactly 1.5 times does not fire', () => {
    expect(insightsFor([[1, 6], [4, 4], ...balancedWithCore])).toEqual([]);
  });

  test('just over 1.5 times fires', () => {
    expect(insightsFor([[1, 7], [4, 4], ...balancedWithCore])).toHaveLength(1);
  });

  test('sums chest, shoulders and triceps against back and biceps', () => {
    expect(insightsFor([[1, 2], [2, 2], [3, 2], [4, 2], [5, 2], ...balancedWithCore])).toEqual([]);
    expect(insightsFor([[1, 2], [2, 2], [3, 2], [4, 1], [5, 1], ...balancedWithCore])).toHaveLength(1);
  });

  test('too little push targets chest', () => {
    const insights = insightsFor([[4, 8], [1, 4], ...balancedWithCore]);
    expect(insights[0]?.action?.destination).toEqual({
      screen: 'exerciseLibrary',
      bodyPart: 'chest',
    });
  });

  test('one side zero and the other at least one set is lopsided', () => {
    expect(insightsFor([[1, 1], ...balancedWithCore])).toHaveLength(1);
    expect(insightsFor([[5, 1], ...balancedWithCore])).toHaveLength(1);
  });

  test('both sides zero does not fire on its own', () => {
    expect(insightsFor(balancedWithCore)).toEqual([]);
  });
});

describe('muscleBalance quads and posterior chain', () => {
  test('too little posterior chain targets hamstrings', () => {
    const insights = insightsFor([[6, 8], [7, 2], [8, 2], ...balancedWithCore]);
    expect(insights).toHaveLength(1);
    expect(insights[0]?.action?.destination).toEqual({
      screen: 'exerciseLibrary',
      bodyPart: 'hamstrings',
    });
  });

  test('exactly 1.5 times does not fire and just over fires', () => {
    expect(insightsFor([[6, 6], [7, 2], [8, 2], ...balancedWithCore])).toEqual([]);
    expect(insightsFor([[6, 7], [7, 2], [8, 2], ...balancedWithCore])).toHaveLength(1);
  });

  test('too few quads targets quadriceps', () => {
    const insights = insightsFor([[7, 4], [8, 4], [6, 2], ...balancedWithCore]);
    expect(insights[0]?.action?.destination).toEqual({
      screen: 'exerciseLibrary',
      bodyPart: 'quadriceps',
    });
  });

  test('quads with no posterior chain is lopsided', () => {
    expect(insightsFor([[6, 1], ...balancedWithCore])).toHaveLength(1);
  });

  test('both sides zero does not fire', () => {
    expect(insightsFor([[10, 3], ...balancedWithCore])).toEqual([]);
  });
});

describe('muscleBalance core', () => {
  test('no core in two weeks fires with a core action', () => {
    const insights = insightsFor([
      [1, 3],
      [4, 3],
    ]);
    expect(insights).toHaveLength(1);
    expect(insights[0]?.action?.destination).toEqual({
      screen: 'exerciseLibrary',
      bodyPart: 'core',
    });
  });

  test('a core set in two weeks does not fire', () => {
    expect(
      insightsFor([
        [1, 3],
        [4, 3],
        [9, 1],
      ]),
    ).toEqual([]);
  });

  test('does not fire when nothing was trained in the two weeks', () => {
    const outsideTwoWeeks = new Date(2026, 8, 20, 18, 0);
    const insights = insightsFor(
      [
        [1, 3],
        [4, 3],
      ],
      outsideTwoWeeks,
    );
    expect(insights).toEqual([]);
  });

  test('a session exactly fourteen days ago counts as training and core', () => {
    const boundary = new Date(2026, 8, 23, 0, 0);
    expect(
      insightsFor(
        [
          [1, 3],
          [4, 3],
        ],
        boundary,
      ),
    ).toHaveLength(1);
    expect(
      insightsFor(
        [
          [1, 3],
          [4, 3],
          [9, 1],
        ],
        boundary,
      ),
    ).toEqual([]);
  });

  test('core outside two weeks but inside four weeks still fires', () => {
    const snapshot = createCoachSnapshot({
      exercisesById,
      sessionsLastTwelveWeeks: [
        sessionWith(new Date(2026, 8, 15, 18, 0), [[9, 3]]),
        sessionWith(recentDate, [
          [1, 3],
          [4, 3],
        ]),
      ],
    });
    expect(muscleBalance(snapshot)).toHaveLength(1);
  });
});

describe('muscleBalance window and priority', () => {
  test('ignores sets older than four weeks', () => {
    const older = new Date(2026, 8, 8, 18, 0);
    expect(
      insightsFor(
        [
          [1, 10],
          [4, 1],
          [9, 1],
        ],
        older,
      ),
    ).toEqual([]);
  });

  test('counts a session exactly four weeks ago', () => {
    const boundary = new Date(2026, 8, 9, 0, 0);
    expect(
      insightsFor(
        [
          [1, 10],
          [4, 1],
          [9, 1],
        ],
        boundary,
      ),
    ).toHaveLength(1);
  });

  test('ignores sets of unknown exercises', () => {
    expect(
      insightsFor([
        [99, 10],
        [9, 1],
      ]),
    ).toEqual([]);
  });

  test('emits one insight and prefers push and pull over legs and core', () => {
    const insights = insightsFor([
      [1, 8],
      [4, 1],
      [6, 8],
    ]);
    expect(insights).toHaveLength(1);
    expect(insights[0]?.action?.destination).toEqual({
      screen: 'exerciseLibrary',
      bodyPart: 'back',
    });
  });

  test('prefers legs over core', () => {
    const insights = insightsFor([
      [1, 4],
      [4, 4],
      [6, 8],
    ]);
    expect(insights[0]?.action?.destination).toEqual({
      screen: 'exerciseLibrary',
      bodyPart: 'hamstrings',
    });
  });

  test('does not fire without sessions', () => {
    expect(muscleBalance(createCoachSnapshot({ exercisesById }))).toEqual([]);
  });
});
