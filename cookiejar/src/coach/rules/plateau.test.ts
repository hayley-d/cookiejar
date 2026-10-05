import { describe, expect, test } from 'bun:test';

import type { FinishedSessionWithSets } from '@/coach/CoachSnapshot';
import { createCoachSnapshot } from '@/coach/coachSnapshotFixture';
import { plateau, plateauPriority } from '@/coach/rules/plateau';
import type { CompletedSet } from '@/progress/detectPersonalRecords';
import type { Exercise } from '@/types/Exercise';

const squat: Exercise = {
  id: 2,
  name: 'Squat',
  bodyPart: 'quadriceps',
  imageUrl: null,
  defaultTrackingType: 'repetitions_and_weight',
  createdAt: '',
};

const exercisesById = new Map([[2, squat]]);

function weightedSet(weightKilograms: number, repetitions: number): CompletedSet {
  return {
    exerciseId: 2,
    trackingType: 'repetitions_and_weight',
    repetitions,
    weightKilograms,
    durationSeconds: null,
    distanceMeters: null,
  };
}

function sessionOn(dayOfMonth: number, sets: CompletedSet[], monthIndex = 9): FinishedSessionWithSets {
  const startedAt = new Date(2026, monthIndex, dayOfMonth, 18, 0);
  return {
    sessionId: startedAt.getTime(),
    startedAt: startedAt.toISOString(),
    workoutName: 'Session',
    sets,
  };
}

function insightsFor(sessions: FinishedSessionWithSets[]) {
  return plateau(createCoachSnapshot({ exercisesById, sessionsLastTwelveWeeks: sessions }));
}

const flatSets = [weightedSet(80, 5)];

describe('plateau', () => {
  test('fires for changeItUp and improvement with an exercise history action', () => {
    const insights = insightsFor([
      sessionOn(14, flatSets, 8),
      sessionOn(21, flatSets, 8),
      sessionOn(28, flatSets, 8),
      sessionOn(5, flatSets),
    ]);
    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({
      ruleIdentifier: 'plateau',
      topics: ['changeItUp', 'improvement'],
      priority: plateauPriority,
      nuggie: 'coach',
      action: {
        label: 'See Squat history',
        destination: { screen: 'exerciseHistory', exerciseId: 2 },
      },
    });
    expect(insights[0].messages[0]).toContain('Squat has been stuck for 3 weeks');
    expect(insights[0].messages[0]).toContain('variation');
    expect(plateauPriority).toBe(60);
  });

  test('exactly 4 sessions across exactly 3 weeks fires', () => {
    expect(
      insightsFor([
        sessionOn(14, flatSets, 8),
        sessionOn(18, flatSets, 8),
        sessionOn(1, flatSets),
        sessionOn(5, flatSets),
      ]),
    ).toHaveLength(1);
  });

  test('3 sessions does not fire', () => {
    expect(insightsFor([sessionOn(14, flatSets, 8), sessionOn(28, flatSets, 8), sessionOn(5, flatSets)])).toEqual([]);
  });

  test('4 sessions across just under 3 weeks does not fire', () => {
    expect(
      insightsFor([
        sessionOn(15, flatSets, 8),
        sessionOn(18, flatSets, 8),
        sessionOn(1, flatSets),
        sessionOn(5, flatSets),
      ]),
    ).toEqual([]);
  });

  test('a rise in the best estimated 1RM does not fire', () => {
    expect(
      insightsFor([
        sessionOn(14, [weightedSet(80, 5)], 8),
        sessionOn(21, flatSets, 8),
        sessionOn(28, flatSets, 8),
        sessionOn(5, [weightedSet(82.5, 5)]),
      ]),
    ).toEqual([]);
  });

  test('a fall counts as no rise', () => {
    expect(
      insightsFor([
        sessionOn(14, [weightedSet(80, 5)], 8),
        sessionOn(21, flatSets, 8),
        sessionOn(28, flatSets, 8),
        sessionOn(5, [weightedSet(75, 5)]),
      ]),
    ).toHaveLength(1);
  });

  test('the best set of each session counts', () => {
    expect(
      insightsFor([
        sessionOn(14, [weightedSet(80, 5), weightedSet(60, 8)], 8),
        sessionOn(21, flatSets, 8),
        sessionOn(28, flatSets, 8),
        sessionOn(5, [weightedSet(60, 8), weightedSet(80, 5)]),
      ]),
    ).toHaveLength(1);
  });

  test('uses best repetitions for repetition exercises', () => {
    const repetitionSet = (repetitions: number): CompletedSet => ({
      exerciseId: 2,
      trackingType: 'repetitions',
      repetitions,
      weightKilograms: null,
      durationSeconds: null,
      distanceMeters: null,
    });
    const sessions = (lastRepetitions: number) => [
      sessionOn(14, [repetitionSet(10)], 8),
      sessionOn(21, [repetitionSet(10)], 8),
      sessionOn(28, [repetitionSet(10)], 8),
      sessionOn(5, [repetitionSet(lastRepetitions)]),
    ];
    expect(insightsFor(sessions(10))).toHaveLength(1);
    expect(insightsFor(sessions(11))).toEqual([]);
  });

  test('uses best duration for duration exercises', () => {
    const durationSet = (durationSeconds: number): CompletedSet => ({
      exerciseId: 2,
      trackingType: 'duration',
      repetitions: null,
      weightKilograms: null,
      durationSeconds,
      distanceMeters: null,
    });
    const sessions = (lastDuration: number) => [
      sessionOn(14, [durationSet(60)], 8),
      sessionOn(21, [durationSet(60)], 8),
      sessionOn(28, [durationSet(60)], 8),
      sessionOn(5, [durationSet(lastDuration)]),
    ];
    expect(insightsFor(sessions(60))).toHaveLength(1);
    expect(insightsFor(sessions(75))).toEqual([]);
  });

  test('ignores sessions older than the window', () => {
    expect(
      insightsFor([
        sessionOn(1, flatSets, 7),
        sessionOn(5, flatSets, 8),
        sessionOn(14, flatSets, 8),
        sessionOn(5, flatSets),
      ]),
    ).toEqual([]);
  });

  test('lists at most 3 plateaus', () => {
    const exercises = [1, 2, 3, 4].map((id) => ({
      ...squat,
      id,
      name: `Exercise ${id}`,
    }));
    const setFor = (exerciseId: number): CompletedSet => ({
      ...weightedSet(80, 5),
      exerciseId,
    });
    const sessions = [
      sessionOn(
        14,
        exercises.map((exercise) => setFor(exercise.id)),
        8,
      ),
      sessionOn(
        21,
        exercises.map((exercise) => setFor(exercise.id)),
        8,
      ),
      sessionOn(
        28,
        exercises.map((exercise) => setFor(exercise.id)),
        8,
      ),
      sessionOn(
        5,
        exercises.map((exercise) => setFor(exercise.id)),
      ),
    ];
    const insights = plateau(
      createCoachSnapshot({
        exercisesById: new Map(exercises.map((exercise) => [exercise.id, exercise])),
        sessionsLastTwelveWeeks: sessions,
      }),
    );
    expect(insights).toHaveLength(3);
  });
});
