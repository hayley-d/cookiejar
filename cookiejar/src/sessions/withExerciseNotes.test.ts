import { describe, expect, test } from 'bun:test';

import { withExerciseNotes } from '@/sessions/withExerciseNotes';
import type { SessionWithExercises } from '@/types/SessionWithExercises';

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
    exercises: [
      { sessionExerciseId: 10, exerciseId: 5 },
      { sessionExerciseId: 20, exerciseId: 6 },
      { sessionExerciseId: 30, exerciseId: 5 },
    ].map(({ sessionExerciseId, exerciseId }) => ({
      id: sessionExerciseId,
      sessionId: 1,
      exerciseId,
      replacedExerciseId: null,
      position: sessionExerciseId,
      supersetGroup: null,
      trackingType: 'repetitions_and_weight' as const,
      restSeconds: 90,
      exercise: { id: exerciseId, name: `Exercise ${exerciseId}`, imageUrl: null, notes: null },
      replacedExerciseName: null,
      sets: [],
    })),
  };
}

describe('withExerciseNotes', () => {
  test('updates every session exercise with the same exercise', () => {
    const changedSession = withExerciseNotes(makeSession(), 5, 'Pause at the bottom');
    expect(changedSession.exercises[0]?.exercise.notes).toBe('Pause at the bottom');
    expect(changedSession.exercises[2]?.exercise.notes).toBe('Pause at the bottom');
  });

  test('leaves other exercises untouched', () => {
    const session = makeSession();
    const changedSession = withExerciseNotes(session, 5, 'Pause at the bottom');
    expect(changedSession.exercises[1]).toBe(session.exercises[1]);
  });

  test('clears the note with null', () => {
    const notedSession = withExerciseNotes(makeSession(), 5, 'Pause at the bottom');
    const clearedSession = withExerciseNotes(notedSession, 5, null);
    expect(clearedSession.exercises[0]?.exercise.notes).toBeNull();
    expect(clearedSession.exercises[2]?.exercise.notes).toBeNull();
  });

  test('an unknown exercise returns the same session', () => {
    const session = makeSession();
    expect(withExerciseNotes(session, 99, 'Note')).toBe(session);
  });
});
