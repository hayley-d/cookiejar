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
  notes: null,
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
      sessionOn(7, flatSets, 8),
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
    expect(insights[0].messages).toEqual([
      "Not noopy! Squat's been stuck at 80 kg × 5 for 4 weeks. I believe in you! Try 4×8–12 at 70 kg for a few weeks, each set 1–2 reps from failure.",
    ]);
    expect(plateauPriority).toBe(60);
  });

  test('exactly 4 sessions across exactly 4 weeks fires', () => {
    expect(
      insightsFor([
        sessionOn(7, flatSets, 8),
        sessionOn(18, flatSets, 8),
        sessionOn(1, flatSets),
        sessionOn(5, flatSets),
      ]),
    ).toHaveLength(1);
  });

  test('3 sessions does not fire', () => {
    expect(insightsFor([sessionOn(7, flatSets, 8), sessionOn(28, flatSets, 8), sessionOn(5, flatSets)])).toEqual([]);
  });

  test('4 sessions across just under 4 weeks does not fire', () => {
    expect(
      insightsFor([
        sessionOn(8, flatSets, 8),
        sessionOn(18, flatSets, 8),
        sessionOn(1, flatSets),
        sessionOn(5, flatSets),
      ]),
    ).toEqual([]);
  });

  test('a rise in the best estimated 1RM does not fire', () => {
    expect(
      insightsFor([
        sessionOn(7, [weightedSet(80, 5)], 8),
        sessionOn(21, flatSets, 8),
        sessionOn(28, flatSets, 8),
        sessionOn(5, [weightedSet(82.5, 5)]),
      ]),
    ).toEqual([]);
  });

  test('a fall counts as no rise', () => {
    expect(
      insightsFor([
        sessionOn(7, [weightedSet(80, 5)], 8),
        sessionOn(21, flatSets, 8),
        sessionOn(28, flatSets, 8),
        sessionOn(5, [weightedSet(75, 5)]),
      ]),
    ).toHaveLength(1);
  });

  test('the best set of each session counts', () => {
    expect(
      insightsFor([
        sessionOn(7, [weightedSet(80, 5), weightedSet(60, 8)], 8),
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
      sessionOn(7, [repetitionSet(10)], 8),
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
      sessionOn(7, [durationSet(60)], 8),
      sessionOn(21, [durationSet(60)], 8),
      sessionOn(28, [durationSet(60)], 8),
      sessionOn(5, [durationSet(lastDuration)]),
    ];
    expect(insightsFor(sessions(60))).toHaveLength(1);
    expect(insightsFor(sessions(75))).toEqual([]);
  });

  test('a session exactly at the window start counts', () => {
    const atWindowStart = new Date(2026, 7, 31, 0, 0);
    expect(
      insightsFor([
        { ...sessionOn(31, flatSets, 7), startedAt: atWindowStart.toISOString() },
        sessionOn(7, flatSets, 8),
        sessionOn(21, flatSets, 8),
        sessionOn(5, flatSets),
      ]),
    ).toHaveLength(1);
  });

  test('a session just before the window start is ignored', () => {
    const beforeWindowStart = new Date(2026, 7, 30, 23, 59);
    expect(
      insightsFor([
        { ...sessionOn(30, flatSets, 7), startedAt: beforeWindowStart.toISOString() },
        sessionOn(7, flatSets, 8),
        sessionOn(21, flatSets, 8),
        sessionOn(5, flatSets),
      ]),
    ).toEqual([]);
  });

  test('earlier gains outside the window do not hide a recent plateau', () => {
    expect(
      insightsFor([
        sessionOn(1, [weightedSet(50, 5)], 7),
        sessionOn(7, flatSets, 8),
        sessionOn(21, flatSets, 8),
        sessionOn(28, flatSets, 8),
        sessionOn(5, flatSets),
      ]),
    ).toHaveLength(1);
  });

  test('ignores sessions older than the window', () => {
    expect(
      insightsFor([
        sessionOn(1, flatSets, 7),
        sessionOn(5, flatSets, 8),
        sessionOn(7, flatSets, 8),
        sessionOn(5, flatSets),
      ]),
    ).toEqual([]);
  });

  test('lists at most 3 plateaus in one insight, longest stall first', () => {
    const exercises = [1, 2, 3, 4].map((id) => ({
      ...squat,
      id,
      name: `Exercise ${id}`,
    }));
    const setFor = (exerciseId: number): CompletedSet => ({
      ...weightedSet(80, 5),
      exerciseId,
    });
    const setsForExercises = (identifiers: number[]) => identifiers.map(setFor);
    const sessions = [
      sessionOn(7, setsForExercises([1, 2, 3, 4]), 8),
      sessionOn(21, setsForExercises([1, 2, 3, 4]), 8),
      sessionOn(28, setsForExercises([1, 2, 3, 4]), 8),
      sessionOn(5, setsForExercises([1, 2, 3, 4])),
      sessionOn(12, setsForExercises([4])),
    ];
    const insights = plateau(
      createCoachSnapshot({
        exercisesById: new Map(exercises.map((exercise) => [exercise.id, exercise])),
        sessionsLastTwelveWeeks: sessions,
      }),
    );
    expect(insights).toHaveLength(1);
    expect(insights[0].messages).toHaveLength(3);
    expect(insights[0].messages[0]).toStartWith("Not noopy! Exercise 4's been stuck at 80 kg × 5 for 5 weeks.");
    expect(insights[0].action?.destination).toEqual({ screen: 'exerciseHistory', exerciseId: 4 });
  });

  test('lists an exercise once when it plateaus under two tracking types', () => {
    const repetitionSet = (repetitions: number): CompletedSet => ({
      exerciseId: 2,
      trackingType: 'repetitions',
      repetitions,
      weightKilograms: null,
      durationSeconds: null,
      distanceMeters: null,
    });
    const insights = insightsFor([
      sessionOn(7, [weightedSet(80, 5), repetitionSet(10)], 8),
      sessionOn(21, [weightedSet(80, 5), repetitionSet(10)], 8),
      sessionOn(28, [weightedSet(80, 5), repetitionSet(10)], 8),
      sessionOn(5, [weightedSet(80, 5), repetitionSet(10)]),
    ]);
    expect(insights).toHaveLength(1);
    expect(insights[0].messages).toHaveLength(1);
  });

  test('the second variant shows on alternate days', () => {
    const insights = plateau(
      createCoachSnapshot({
        now: new Date(2026, 9, 8, 9, 0),
        exercisesById,
        sessionsLastTwelveWeeks: [
          sessionOn(7, flatSets, 8),
          sessionOn(21, flatSets, 8),
          sessionOn(28, flatSets, 8),
          sessionOn(5, flatSets),
        ],
      }),
    );
    expect(insights[0].messages[0]).toStartWith("Ohh noops, Squat hasn't moved past 80 kg × 5 in 4 weeks.");
  });

  test('weighted sets over 12 reps plateau on their heaviest weight', () => {
    const highRepetitionSessions = (lastWeight: number) => [
      sessionOn(7, [weightedSet(40, 15)], 8),
      sessionOn(21, [weightedSet(40, 15)], 8),
      sessionOn(28, [weightedSet(40, 16)], 8),
      sessionOn(5, [weightedSet(lastWeight, 15)]),
    ];
    expect(insightsFor(highRepetitionSessions(40))).toHaveLength(1);
    expect(insightsFor(highRepetitionSessions(42.5))).toEqual([]);
  });

  test('current sets and reps are averaged over the last 3 sessions, so one weak session does not change the advice', () => {
    const fourByTen = Array.from({ length: 4 }, () => weightedSet(60, 10));
    const weakSession = [weightedSet(55, 8), weightedSet(55, 8)];
    const insights = insightsFor([
      sessionOn(7, fourByTen, 8),
      sessionOn(21, fourByTen, 8),
      sessionOn(28, fourByTen, 8),
      sessionOn(5, weakSession),
    ]);
    expect(insights[0].messages[0]).toEndWith('Keep your 10 reps and add a set: 4×10, each set 1–2 reps from failure.');
  });
});
