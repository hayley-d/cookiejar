import { describe, expect, test } from 'bun:test';

import { findSessionSet, withSessionSetChanges } from '@/sessions/sessionSetChanges';
import type { SessionSet } from '@/types/SessionSet';
import type { SessionWithExercises } from '@/types/SessionWithExercises';

function makeSet(id: number, sessionExerciseId: number): SessionSet {
  return {
    id,
    sessionExerciseId,
    position: id,
    targetRepetitions: 8,
    targetWeightKilograms: 60,
    targetDurationSeconds: null,
    targetDistanceMeters: null,
    repetitions: null,
    weightKilograms: null,
    durationSeconds: null,
    distanceMeters: null,
    completedAt: null,
  };
}

function makeSession(): SessionWithExercises {
  return {
    id: 1,
    workoutId: 2,
    planEntryId: null,
    workoutName: 'Push Day',
    workoutKind: 'individual',
    classType: null,
    scheduledDate: '2026-10-05',
    startedAt: '2026-10-05T08:00:00Z',
    finishedAt: null,
    notes: null,
    healthWorkoutUuid: null,
    healthAverageHeartRate: null,
    healthMaximumHeartRate: null,
    healthActiveKilocalories: null,
    healthDurationSeconds: null,
    plannedDurationMinutes: null,
    exercises: [10, 20].map((sessionExerciseId) => ({
      id: sessionExerciseId,
      sessionId: 1,
      exerciseId: sessionExerciseId,
      replacedExerciseId: null,
      position: sessionExerciseId,
      supersetGroup: null,
      trackingType: 'repetitions_and_weight' as const,
      restSeconds: 90,
      exercise: { id: sessionExerciseId, name: `Exercise ${sessionExerciseId}`, imageUrl: null, notes: null },
      replacedExerciseName: null,
      sets: [makeSet(sessionExerciseId + 1, sessionExerciseId), makeSet(sessionExerciseId + 2, sessionExerciseId)],
    })),
  };
}

describe('findSessionSet', () => {
  test('finds a set with its exercise', () => {
    const found = findSessionSet(makeSession(), 22);
    expect(found?.exercise.id).toBe(20);
    expect(found?.set.id).toBe(22);
  });

  test('returns null for an unknown set', () => {
    expect(findSessionSet(makeSession(), 99)).toBeNull();
  });
});

describe('withSessionSetChanges', () => {
  test('changes only the given set', () => {
    const session = makeSession();
    const changedSession = withSessionSetChanges(session, 21, { weightKilograms: 62.5 });
    expect(findSessionSet(changedSession, 21)?.set.weightKilograms).toBe(62.5);
    expect(findSessionSet(changedSession, 22)?.set.weightKilograms).toBeNull();
    expect(changedSession.exercises[0]).toBe(session.exercises[0]);
  });

  test('an unknown set returns the same session', () => {
    const session = makeSession();
    expect(withSessionSetChanges(session, 99, { repetitions: 3 })).toBe(session);
  });
});
