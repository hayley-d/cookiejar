import { describe, expect, test } from 'bun:test';

import type { DefaultSwimWorkout } from '@/swimming/defaultSwimWorkouts';
import { planSwimWorkoutSeeding } from '@/swimming/planSwimWorkoutSeeding';

function buildWorkout(builtInKey: string): DefaultSwimWorkout {
  return { builtInKey, name: builtInKey, poolLengthMeters: 25, sections: [] };
}

const content = [buildWorkout('swim-a'), buildWorkout('swim-b'), buildWorkout('swim-c')];

describe('planSwimWorkoutSeeding', () => {
  test('inserts everything on the first run', () => {
    const plan = planSwimWorkoutSeeding({
      storedBuiltInWorkouts: [],
      storedVersion: null,
      contentVersion: 'v1',
      dismissedKeys: [],
      content,
    });
    expect(plan.inserts.map((workout) => workout.builtInKey)).toEqual(['swim-a', 'swim-b', 'swim-c']);
    expect(plan.updates).toEqual([]);
  });

  test('does nothing when the stored version matches', () => {
    const plan = planSwimWorkoutSeeding({
      storedBuiltInWorkouts: [{ workoutId: 1, builtInKey: 'swim-a' }],
      storedVersion: 'v1',
      contentVersion: 'v1',
      dismissedKeys: [],
      content,
    });
    expect(plan).toEqual({ inserts: [], updates: [] });
  });

  test('updates stored built-ins in place and inserts new ones on a version bump', () => {
    const plan = planSwimWorkoutSeeding({
      storedBuiltInWorkouts: [
        { workoutId: 7, builtInKey: 'swim-a' },
        { workoutId: 9, builtInKey: 'swim-b' },
      ],
      storedVersion: 'v1',
      contentVersion: 'v2',
      dismissedKeys: [],
      content,
    });
    expect(plan.updates.map((update) => [update.workoutId, update.workout.builtInKey])).toEqual([
      [7, 'swim-a'],
      [9, 'swim-b'],
    ]);
    expect(plan.inserts.map((workout) => workout.builtInKey)).toEqual(['swim-c']);
  });

  test('never inserts or updates dismissed keys', () => {
    const plan = planSwimWorkoutSeeding({
      storedBuiltInWorkouts: [{ workoutId: 7, builtInKey: 'swim-a' }],
      storedVersion: null,
      contentVersion: 'v1',
      dismissedKeys: ['swim-a', 'swim-c'],
      content,
    });
    expect(plan.inserts.map((workout) => workout.builtInKey)).toEqual(['swim-b']);
    expect(plan.updates).toEqual([]);
  });

  test('leaves stored workouts that are not in the content untouched', () => {
    const plan = planSwimWorkoutSeeding({
      storedBuiltInWorkouts: [{ workoutId: 3, builtInKey: 'swim-retired' }],
      storedVersion: 'v1',
      contentVersion: 'v2',
      dismissedKeys: [],
      content,
    });
    expect(plan.updates).toEqual([]);
    expect(plan.inserts).toHaveLength(3);
  });
});
