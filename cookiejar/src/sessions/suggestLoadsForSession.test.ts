import { describe, expect, test } from 'bun:test';

import { suggestLoadsForSession } from '@/sessions/suggestLoadsForSession';
import type { SessionExerciseWithSets, SessionWithExercises } from '@/types/SessionWithExercises';
import type { TrackingType } from '@/types/TrackingType';

function makeExercise(
  id: number,
  exerciseId: number,
  trackingType: TrackingType,
  targetRepetitions: number | null,
): SessionExerciseWithSets {
  return {
    id,
    sessionId: 1,
    exerciseId,
    replacedExerciseId: null,
    position: id,
    supersetGroup: null,
    trackingType,
    restSeconds: 90,
    exercise: { id: exerciseId, name: `Exercise ${exerciseId}`, imageUrl: null, notes: null },
    replacedExerciseName: null,
    sets: [
      {
        id: id * 10,
        sessionExerciseId: id,
        position: 1,
        targetRepetitions,
        targetWeightKilograms: null,
        targetDurationSeconds: null,
        targetDistanceMeters: null,
        repetitions: null,
        weightKilograms: null,
        durationSeconds: null,
        distanceMeters: null,
        completedAt: null,
      },
    ],
  };
}

function makeSession(exercises: SessionExerciseWithSets[]): SessionWithExercises {
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
    exercises,
  };
}

const strongSessions = [[{ weightKilograms: 60, repetitions: 12 }]];

describe('suggestLoadsForSession', () => {
  test('suggests by session exercise using that exercise history', () => {
    const session = makeSession([makeExercise(10, 5, 'repetitions_and_weight', 12), makeExercise(20, 6, 'repetitions_and_weight', 12)]);
    const suggestions = suggestLoadsForSession(session, new Map([[5, strongSessions]]), null);
    expect(suggestions.get(10)?.weightKilograms).toBe(60);
    expect(suggestions.has(20)).toBe(false);
  });

  test('skips non weight tracking types', () => {
    const session = makeSession([makeExercise(10, 5, 'repetitions', 12)]);
    expect(suggestLoadsForSession(session, new Map([[5, strongSessions]]), null).size).toBe(0);
  });

  test('uses the profile goal when there are no target repetitions', () => {
    const threeSessions = [0, 1, 2].map(() => [{ weightKilograms: 60, repetitions: 6 }]);
    const session = makeSession([makeExercise(10, 5, 'repetitions_and_weight', null)]);
    expect(suggestLoadsForSession(session, new Map([[5, threeSessions]]), 'strength').get(10)?.weightKilograms).toBe(62.5);
    expect(suggestLoadsForSession(session, new Map([[5, threeSessions]]), 'hypertrophy').get(10)?.weightKilograms).toBe(60);
  });

  test('takes the rep range top from the sets that receive the suggestion', () => {
    const pyramid = makeExercise(10, 5, 'repetitions_and_weight', 8);
    const baseSet = pyramid.sets[0];
    pyramid.sets = [
      { ...baseSet, id: 101, position: 1, targetRepetitions: 15, targetWeightKilograms: 40 },
      { ...baseSet, id: 102, position: 2, targetRepetitions: 12, targetWeightKilograms: 50 },
      { ...baseSet, id: 103, position: 3, targetRepetitions: 8, targetWeightKilograms: 60 },
    ];
    const threeSessions = [0, 1, 2].map(() => [{ weightKilograms: 60, repetitions: 8 }]);
    const suggestion = suggestLoadsForSession(makeSession([pyramid]), new Map([[5, threeSessions]]), null).get(10);
    expect(suggestion?.weightKilograms).toBe(62.5);
  });
});
