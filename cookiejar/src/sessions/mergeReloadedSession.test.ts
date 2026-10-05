import { describe, expect, test } from 'bun:test';

import { mergeReloadedSession } from '@/sessions/mergeReloadedSession';
import type { SessionWithExercises } from '@/types/SessionWithExercises';

function makeSession(overrides: { completedAt: string | null; repetitions: number | null; restSeconds: number | null }) {
  const session: SessionWithExercises = {
    id: 1,
    workoutId: null,
    planEntryId: null,
    workoutName: 'Push',
    workoutKind: 'individual',
    classType: null,
    scheduledDate: '2026-10-05',
    startedAt: '2026-10-05T10:00:00.000Z',
    finishedAt: null,
    notes: null,
    healthWorkoutUuid: null,
    healthAverageHeartRate: null,
    healthMaximumHeartRate: null,
    healthActiveKilocalories: null,
    healthDurationSeconds: null,
    plannedDurationMinutes: null,
    exercises: [
      {
        id: 10,
        sessionId: 1,
        exerciseId: 5,
        replacedExerciseId: null,
        position: 0,
        supersetGroup: null,
        trackingType: 'repetitions',
        restSeconds: overrides.restSeconds,
        exercise: { id: 5, name: 'Squat', imageUrl: null },
        replacedExerciseName: null,
        sets: [
          {
            id: 100,
            sessionExerciseId: 10,
            position: 0,
            targetRepetitions: 8,
            targetWeightKilograms: null,
            targetDurationSeconds: null,
            targetDistanceMeters: null,
            repetitions: overrides.repetitions,
            weightKilograms: null,
            durationSeconds: null,
            distanceMeters: null,
            completedAt: overrides.completedAt,
          },
        ],
      },
    ],
  };
  return session;
}

const noPending = { pendingValueSetIds: new Set<number>(), hasPendingNotes: false };

describe('mergeReloadedSession', () => {
  test('a tick made while a structural change was queued survives the reload', () => {
    const reloaded = makeSession({ completedAt: null, repetitions: null, restSeconds: 90 });
    const local = makeSession({ completedAt: '2026-10-05T10:05:00.000Z', repetitions: 8, restSeconds: 90 });
    const merged = mergeReloadedSession(reloaded, local, noPending);
    expect(merged.exercises[0]?.sets[0]).toMatchObject({ completedAt: '2026-10-05T10:05:00.000Z', repetitions: 8 });
  });

  test('an untick made in the window survives the reload', () => {
    const reloaded = makeSession({ completedAt: '2026-10-05T10:05:00.000Z', repetitions: 8, restSeconds: 90 });
    const local = makeSession({ completedAt: null, repetitions: 8, restSeconds: 90 });
    expect(mergeReloadedSession(reloaded, local, noPending).exercises[0]?.sets[0]?.completedAt).toBeNull();
  });

  test('a rest change made in the window survives the reload', () => {
    const reloaded = makeSession({ completedAt: null, repetitions: null, restSeconds: 90 });
    const local = makeSession({ completedAt: null, repetitions: null, restSeconds: 60 });
    expect(mergeReloadedSession(reloaded, local, noPending).exercises[0]?.restSeconds).toBe(60);
  });

  test('database values win when nothing local is newer', () => {
    const reloaded = makeSession({ completedAt: null, repetitions: null, restSeconds: 90 });
    const local = makeSession({ completedAt: null, repetitions: 12, restSeconds: 90 });
    expect(mergeReloadedSession(reloaded, local, noPending).exercises[0]?.sets[0]?.repetitions).toBeNull();
  });

  test('typed values with a pending write are kept', () => {
    const reloaded = makeSession({ completedAt: null, repetitions: null, restSeconds: 90 });
    const local = makeSession({ completedAt: null, repetitions: 12, restSeconds: 90 });
    const merged = mergeReloadedSession(reloaded, local, { ...noPending, pendingValueSetIds: new Set([100]) });
    expect(merged.exercises[0]?.sets[0]?.repetitions).toBe(12);
  });

  test('pending notes are kept', () => {
    const reloaded = makeSession({ completedAt: null, repetitions: null, restSeconds: 90 });
    const local = { ...makeSession({ completedAt: null, repetitions: null, restSeconds: 90 }), notes: 'felt good' };
    expect(mergeReloadedSession(reloaded, local, { ...noPending, hasPendingNotes: true }).notes).toBe('felt good');
    expect(mergeReloadedSession(reloaded, local, noPending).notes).toBeNull();
  });
});
