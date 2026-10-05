import { describe, expect, test } from 'bun:test';

import {
  createKeyCounter,
  createWorkoutEditorReducer,
  defaultClassDetails,
  initialWorkoutEditorState,
  type LoadedWorkout,
  type WorkoutEditorState,
} from '@/workouts/workoutEditorReducer';

function createReducer() {
  return createWorkoutEditorReducer(createKeyCounter('test'));
}

const loadedIndividualWorkout: LoadedWorkout = {
  workoutId: 7,
  name: 'Push Day',
  kind: 'individual',
  classDetails: null,
  items: [
    {
      exercise: { id: 3, name: 'Bench Press', imageUrl: null, defaultTrackingType: 'repetitions_and_weight' },
      trackingType: 'repetitions_and_weight',
      supersetGroup: null,
      restSeconds: 90,
      targetSets: [
        { repetitions: 10, weightKilograms: 60, durationSeconds: null, distanceMeters: null },
        { repetitions: 8, weightKilograms: 65, durationSeconds: null, distanceMeters: null },
      ],
    },
    {
      exercise: { id: 5, name: 'Plank', imageUrl: null, defaultTrackingType: 'duration' },
      trackingType: 'duration',
      supersetGroup: null,
      restSeconds: null,
      targetSets: [{ repetitions: null, weightKilograms: null, durationSeconds: 60, distanceMeters: null }],
    },
  ],
};

describe('createKeyCounter', () => {
  test('counts up from one with its prefix', () => {
    const createKey = createKeyCounter('editor');
    expect([createKey(), createKey(), createKey()]).toEqual(['editor-1', 'editor-2', 'editor-3']);
  });

  test('separate counters do not share a count', () => {
    const firstCounter = createKeyCounter('editor');
    firstCounter();
    expect(createKeyCounter('editor')()).toBe('editor-1');
  });
});

describe('workoutEditorReducer', () => {
  test('the initial state is an unnamed, unchanged individual workout', () => {
    expect(initialWorkoutEditorState).toEqual({
      workoutId: null,
      name: '',
      kind: 'individual',
      classDetails: null,
      items: [],
      hasUnsavedChanges: false,
    });
  });

  test('renamed sets the name as typed and marks unsaved changes', () => {
    const state = createReducer()(initialWorkoutEditorState, { type: 'renamed', name: ' Pilates ' });
    expect(state.name).toBe(' Pilates ');
    expect(state.hasUnsavedChanges).toBe(true);
  });

  test('choosing class starts the class details at 45 minutes', () => {
    const state = createReducer()(initialWorkoutEditorState, { type: 'kindChosen', kind: 'class' });
    expect(state.kind).toBe('class');
    expect(state.classDetails).toEqual({ classType: 'yoga', durationMinutes: 45, description: '', imageUrl: '' });
    expect(state.hasUnsavedChanges).toBe(true);
  });

  test('choosing class again keeps the class details already entered', () => {
    const reducer = createReducer();
    const pilatesState = reducer(reducer(initialWorkoutEditorState, { type: 'kindChosen', kind: 'class' }), {
      type: 'classDetailsChanged',
      changes: { classType: 'pilates', durationMinutes: 50 },
    });
    const state = reducer(pilatesState, { type: 'kindChosen', kind: 'class' });
    expect(state.classDetails).toEqual({ ...defaultClassDetails, classType: 'pilates', durationMinutes: 50 });
  });

  test('choosing individual clears the class details', () => {
    const reducer = createReducer();
    const classState = reducer(initialWorkoutEditorState, { type: 'kindChosen', kind: 'class' });
    const state = reducer(classState, { type: 'kindChosen', kind: 'individual' });
    expect(state.kind).toBe('individual');
    expect(state.classDetails).toBeNull();
  });

  test('classDetailsChanged merges only the changed fields', () => {
    const reducer = createReducer();
    const classState = reducer(initialWorkoutEditorState, { type: 'kindChosen', kind: 'class' });
    const state = reducer(classState, { type: 'classDetailsChanged', changes: { description: 'Core focus' } });
    expect(state.classDetails).toEqual({ ...defaultClassDetails, description: 'Core focus' });
  });

  test('classDetailsChanged without class details starts from the defaults', () => {
    const state = createReducer()(initialWorkoutEditorState, {
      type: 'classDetailsChanged',
      changes: { classType: 'spin' },
    });
    expect(state.classDetails).toEqual({ ...defaultClassDetails, classType: 'spin' });
    expect(state.hasUnsavedChanges).toBe(true);
  });

  test('loaded replaces the state and starts with no unsaved changes', () => {
    const changedState: WorkoutEditorState = {
      ...initialWorkoutEditorState,
      name: 'Draft',
      hasUnsavedChanges: true,
    };
    const state = createReducer()(changedState, {
      type: 'loaded',
      workout: {
        workoutId: 4,
        name: 'Morning Pilates',
        kind: 'class',
        classDetails: { classType: 'pilates', durationMinutes: 50, description: '', imageUrl: '' },
        items: [],
      },
    });
    expect(state).toEqual({
      workoutId: 4,
      name: 'Morning Pilates',
      kind: 'class',
      classDetails: { classType: 'pilates', durationMinutes: 50, description: '', imageUrl: '' },
      items: [],
      hasUnsavedChanges: false,
    });
  });

  test('loaded gives every item and target set a key from the counter, in order', () => {
    const state = createReducer()(initialWorkoutEditorState, { type: 'loaded', workout: loadedIndividualWorkout });
    expect(state.items.map((item) => item.key)).toEqual(['test-1', 'test-4']);
    expect(state.items[0].targetSets.map((targetSet) => targetSet.key)).toEqual(['test-2', 'test-3']);
    expect(state.items[1].targetSets.map((targetSet) => targetSet.key)).toEqual(['test-5']);
  });

  test('loaded keeps each item and target set value', () => {
    const state = createReducer()(initialWorkoutEditorState, { type: 'loaded', workout: loadedIndividualWorkout });
    expect(state.items[0]).toMatchObject({
      exercise: { id: 3, name: 'Bench Press' },
      trackingType: 'repetitions_and_weight',
      restSeconds: 90,
    });
    expect(state.items[0].targetSets[1]).toMatchObject({ repetitions: 8, weightKilograms: 65 });
  });

  test('the reducer does not change the state it was given', () => {
    const reducer = createReducer();
    const classState = reducer(initialWorkoutEditorState, { type: 'kindChosen', kind: 'class' });
    const classDetailsBefore = classState.classDetails;
    reducer(classState, { type: 'classDetailsChanged', changes: { durationMinutes: 60 } });
    expect(classState.classDetails).toBe(classDetailsBefore);
    expect(classState.classDetails?.durationMinutes).toBe(45);
  });
});
