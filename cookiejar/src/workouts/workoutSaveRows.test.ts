import { describe, expect, test } from 'bun:test';

import { initialWorkoutEditorState, type WorkoutEditorState } from '@/workouts/workoutEditorReducer';
import { toWorkoutSaveRows } from '@/workouts/workoutSaveRows';

const pilatesState: WorkoutEditorState = {
  ...initialWorkoutEditorState,
  name: '  Morning Pilates  ',
  kind: 'class',
  classDetails: {
    classType: 'pilates',
    durationMinutes: 50,
    description: '  Reformer, core focus  ',
    imageUrl: '  https://example.com/pilates.jpg  ',
  },
  hasUnsavedChanges: true,
};

describe('toWorkoutSaveRows', () => {
  test('a class workout saves its trimmed name and class details', () => {
    expect(toWorkoutSaveRows(pilatesState).workout).toEqual({
      name: 'Morning Pilates',
      kind: 'class',
      classType: 'pilates',
      durationMinutes: 50,
      description: 'Reformer, core focus',
      imageUrl: 'https://example.com/pilates.jpg',
    });
  });

  test('a class workout has no items', () => {
    expect(toWorkoutSaveRows(pilatesState).items).toEqual([]);
  });

  test('a class workout with an empty description and image URL stores null for both', () => {
    const rows = toWorkoutSaveRows({
      ...pilatesState,
      classDetails: { classType: 'yoga', durationMinutes: 45, description: '   ', imageUrl: ' ' },
    });
    expect(rows.workout.description).toBeNull();
    expect(rows.workout.imageUrl).toBeNull();
  });

  test('a class workout with no class details saves the defaults', () => {
    const rows = toWorkoutSaveRows({ ...pilatesState, classDetails: null });
    expect(rows.workout).toMatchObject({ classType: 'yoga', durationMinutes: 45 });
  });

  test('a new workout has no workout id and an existing one keeps its id', () => {
    expect(toWorkoutSaveRows(pilatesState).workoutId).toBeNull();
    expect(toWorkoutSaveRows({ ...pilatesState, workoutId: 12 }).workoutId).toBe(12);
  });

  test('an individual workout saves no class fields', () => {
    const rows = toWorkoutSaveRows({ ...initialWorkoutEditorState, name: ' Push Day ' });
    expect(rows.workout).toEqual({
      name: 'Push Day',
      kind: 'individual',
      classType: null,
      durationMinutes: null,
      description: null,
      imageUrl: null,
    });
  });

  test('an individual workout saves its items and target sets with positions in order', () => {
    const rows = toWorkoutSaveRows({
      ...initialWorkoutEditorState,
      name: 'Push Day',
      items: [
        {
          key: 'item-1',
          exercise: { id: 3, name: 'Bench Press', imageUrl: null, defaultTrackingType: 'repetitions_and_weight' },
          trackingType: 'repetitions_and_weight',
          supersetGroup: 'A',
          restSeconds: 90,
          targetSets: [
            { key: 'set-1', repetitions: 10, weightKilograms: 60, durationSeconds: null, distanceMeters: null },
            { key: 'set-2', repetitions: 8, weightKilograms: 65, durationSeconds: null, distanceMeters: null },
          ],
        },
        {
          key: 'item-2',
          exercise: { id: 5, name: 'Plank', imageUrl: null, defaultTrackingType: 'duration' },
          trackingType: 'duration',
          supersetGroup: 'A',
          restSeconds: null,
          targetSets: [],
        },
      ],
    });
    expect(rows.items).toEqual([
      {
        exerciseId: 3,
        position: 0,
        supersetGroup: 'A',
        trackingType: 'repetitions_and_weight',
        restSeconds: 90,
        targetSets: [
          { position: 0, repetitions: 10, weightKilograms: 60, durationSeconds: null, distanceMeters: null },
          { position: 1, repetitions: 8, weightKilograms: 65, durationSeconds: null, distanceMeters: null },
        ],
      },
      {
        exerciseId: 5,
        position: 1,
        supersetGroup: 'A',
        trackingType: 'duration',
        restSeconds: null,
        targetSets: [],
      },
    ]);
  });
});
