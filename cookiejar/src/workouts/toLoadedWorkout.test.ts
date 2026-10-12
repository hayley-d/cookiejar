import { describe, expect, test } from 'bun:test';

import type { WorkoutWithItems } from '@/types/WorkoutWithItems';
import { toLoadedWorkout } from '@/workouts/toLoadedWorkout';
import {
  createKeyCounter,
  createWorkoutEditorReducer,
  initialWorkoutEditorState,
} from '@/workouts/workoutEditorReducer';
import { toWorkoutSaveRows } from '@/workouts/workoutSaveRows';

const baseWorkout = {
  id: 7,
  name: 'Push Day',
  createdAt: '2026-10-05T08:00:00.000Z',
  updatedAt: '2026-10-05T09:00:00.000Z',
};

const individualWorkout: WorkoutWithItems = {
  ...baseWorkout,
  kind: 'individual',
  classType: null,
  activityType: null,
  durationMinutes: null,
  description: null,
  imageUrl: null,
  builtInKey: null,
  swim: null,
  items: [
    {
      id: 11,
      workoutId: 7,
      exerciseId: 3,
      position: 0,
      supersetGroup: 'A',
      trackingType: 'repetitions_and_weight',
      restSeconds: 90,
      notes: null,
      exercise: { id: 3, name: 'Bench Press', bodyPart: 'chest', imageUrl: null, videoUrl: null, defaultTrackingType: 'repetitions_and_weight' },
      targetSets: [
        {
          id: 21,
          workoutItemId: 11,
          position: 0,
          repetitions: 8,
          weightKilograms: 60.5,
          durationSeconds: null,
          distanceMeters: null,
        },
        {
          id: 22,
          workoutItemId: 11,
          position: 1,
          repetitions: null,
          weightKilograms: null,
          durationSeconds: null,
          distanceMeters: null,
        },
      ],
    },
    {
      id: 12,
      workoutId: 7,
      exerciseId: 4,
      position: 1,
      supersetGroup: 'A',
      trackingType: 'distance',
      restSeconds: null,
      notes: null,
      exercise: { id: 4, name: 'Run', bodyPart: 'cardio', imageUrl: 'https://example.com/run.jpg', videoUrl: null, defaultTrackingType: 'distance' },
      targetSets: [
        {
          id: 23,
          workoutItemId: 12,
          position: 0,
          repetitions: null,
          weightKilograms: null,
          durationSeconds: null,
          distanceMeters: 2500,
        },
      ],
    },
  ],
};

const classWorkout: WorkoutWithItems = {
  ...baseWorkout,
  id: 8,
  name: 'Evening Yoga',
  kind: 'class',
  classType: 'yoga',
  activityType: null,
  durationMinutes: 60,
  description: null,
  imageUrl: 'https://example.com/yoga.jpg',
  builtInKey: null,
  swim: null,
  items: [],
};

const swimWorkout: WorkoutWithItems = {
  ...baseWorkout,
  id: 10,
  name: 'Tuesday Swim',
  kind: 'swim',
  classType: null,
  activityType: null,
  durationMinutes: null,
  description: 'Easy pool session',
  imageUrl: null,
  builtInKey: null,
  swim: {
    poolLengthMeters: 50,
    sections: [
      {
        name: 'Main',
        blocks: [
          {
            rounds: 3,
            restAfterSeconds: 60,
            sets: [
              {
                exerciseId: 5,
                exerciseName: 'Backstroke',
                repetitions: 4,
                distanceMeters: 100,
                restMode: 'send_off',
                restSeconds: null,
                sendOffSeconds: 105,
                restAfterSeconds: 20,
                equipment: ['fins'],
                notes: 'build',
              },
            ],
          },
        ],
      },
    ],
  },
  items: [],
};

describe('toLoadedWorkout', () => {
  test('an individual workout keeps its items, nullable fields and distance in metres', () => {
    const loadedWorkout = toLoadedWorkout(individualWorkout);

    expect(loadedWorkout.workoutId).toBe(7);
    expect(loadedWorkout.kind).toBe('individual');
    expect(loadedWorkout.classDetails).toBeNull();
    expect(loadedWorkout.items).toHaveLength(2);
    expect(loadedWorkout.items[0]).toEqual({
      exercise: { id: 3, name: 'Bench Press', imageUrl: null, defaultTrackingType: 'repetitions_and_weight' },
      trackingType: 'repetitions_and_weight',
      supersetGroup: 'A',
      restSeconds: 90,
      targetSets: [
        { repetitions: 8, weightKilograms: 60.5, durationSeconds: null, distanceMeters: null },
        { repetitions: null, weightKilograms: null, durationSeconds: null, distanceMeters: null },
      ],
    });
    expect(loadedWorkout.items[1]?.targetSets[0]?.distanceMeters).toBe(2500);
  });

  test('a class workout turns nullable details into form text', () => {
    const loadedWorkout = toLoadedWorkout(classWorkout);

    expect(loadedWorkout.kind).toBe('class');
    expect(loadedWorkout.classDetails).toEqual({
      classType: 'yoga',
      durationMinutes: 60,
      description: '',
      imageUrl: 'https://example.com/yoga.jpg',
    });
    expect(loadedWorkout.items).toEqual([]);
    expect(loadedWorkout.activityDetails).toBeNull();
  });

  test('an activity workout turns nullable details into form text', () => {
    const loadedWorkout = toLoadedWorkout({
      ...baseWorkout,
      id: 9,
      name: 'Table Mountain',
      kind: 'activity',
      classType: null,
      activityType: 'hike',
      durationMinutes: null,
      description: 'Platteklip Gorge',
      imageUrl: null,
      builtInKey: null,
      swim: null,
      items: [],
    });

    expect(loadedWorkout.kind).toBe('activity');
    expect(loadedWorkout.classDetails).toBeNull();
    expect(loadedWorkout.activityDetails).toEqual({ activityType: 'hike', description: 'Platteklip Gorge', imageUrl: '' });
    expect(loadedWorkout.items).toEqual([]);
  });

  test('a swim workout loads its pool length, description and structure', () => {
    const loadedWorkout = toLoadedWorkout(swimWorkout);

    expect(loadedWorkout.kind).toBe('swim');
    expect(loadedWorkout.items).toEqual([]);
    expect(loadedWorkout.swimDetails).toEqual({
      poolLengthMeters: 50,
      description: 'Easy pool session',
      imageUrl: '',
      sections: swimWorkout.swim?.sections ?? [],
    });
  });

  test('saving a loaded swim workout reproduces its structure', () => {
    const reducer = createWorkoutEditorReducer(createKeyCounter('test'));
    const state = reducer(initialWorkoutEditorState, { type: 'loaded', workout: toLoadedWorkout(swimWorkout) });
    const saveRows = toWorkoutSaveRows(state);

    expect(saveRows.workout).toEqual({
      name: 'Tuesday Swim',
      kind: 'swim',
      classType: null,
      activityType: null,
      durationMinutes: null,
      poolLengthMeters: 50,
      description: 'Easy pool session',
      imageUrl: null,
    });
    expect(saveRows.swimSections).toEqual(swimWorkout.swim?.sections ?? []);
    expect(saveRows.items).toEqual([]);
  });

  test('loading assigns keys from the counter and starts without unsaved changes', () => {
    const reducer = createWorkoutEditorReducer(createKeyCounter('test'));
    const state = reducer(initialWorkoutEditorState, { type: 'loaded', workout: toLoadedWorkout(individualWorkout) });

    expect(state.hasUnsavedChanges).toBe(false);
    expect(state.workoutId).toBe(7);
    expect(state.items.map((item) => item.key)).toEqual(['test-1', 'test-4']);
    expect(state.items[0]?.targetSets.map((targetSet) => targetSet.key)).toEqual(['test-2', 'test-3']);
  });

  test('saving a loaded workout reproduces the rows that were loaded', () => {
    const reducer = createWorkoutEditorReducer(createKeyCounter('test'));
    const state = reducer(initialWorkoutEditorState, { type: 'loaded', workout: toLoadedWorkout(individualWorkout) });
    const saveRows = toWorkoutSaveRows(state);

    expect(saveRows.workoutId).toBe(7);
    expect(saveRows.items.map((item) => item.exerciseId)).toEqual([3, 4]);
    expect(saveRows.items.map((item) => item.supersetGroup)).toEqual(['A', 'A']);
    expect(saveRows.items[0]?.restSeconds).toBe(90);
    expect(saveRows.items[1]?.targetSets[0]?.distanceMeters).toBe(2500);
  });
});
