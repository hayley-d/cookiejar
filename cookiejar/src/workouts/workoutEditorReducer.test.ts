import { describe, expect, test } from 'bun:test';

import {
  createKeyCounter,
  createWorkoutEditorReducer,
  defaultClassDetails,
  initialWorkoutEditorState,
  type EditorExercise,
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

const benchPress: EditorExercise = {
  id: 3,
  name: 'Bench Press',
  imageUrl: 'https://example.com/bench.jpg',
  defaultTrackingType: 'repetitions_and_weight',
};
const plank: EditorExercise = { id: 5, name: 'Plank', imageUrl: null, defaultTrackingType: 'duration' };
const rowing: EditorExercise = { id: 8, name: 'Rowing', imageUrl: null, defaultTrackingType: 'distance' };

function stateWithBenchPress() {
  const reducer = createReducer();
  const state = reducer(initialWorkoutEditorState, { type: 'exercisesAdded', exercises: [benchPress] });
  return { reducer, state, itemKey: state.items[0].key, targetSetKey: state.items[0].targetSets[0].key };
}

describe('exercisesAdded', () => {
  test('adds one item per exercise in the order given', () => {
    const state = createReducer()(initialWorkoutEditorState, {
      type: 'exercisesAdded',
      exercises: [plank, benchPress, rowing],
    });
    expect(state.items.map((item) => item.exercise.name)).toEqual(['Plank', 'Bench Press', 'Rowing']);
    expect(state.hasUnsavedChanges).toBe(true);
  });

  test('a new item uses the default tracking type and starts with one empty set', () => {
    const state = createReducer()(initialWorkoutEditorState, { type: 'exercisesAdded', exercises: [benchPress] });
    expect(state.items[0]).toEqual({
      key: 'test-1',
      exercise: benchPress,
      trackingType: 'repetitions_and_weight',
      supersetGroup: null,
      restSeconds: null,
      targetSets: [
        { key: 'test-2', repetitions: null, weightKilograms: null, durationSeconds: null, distanceMeters: null },
      ],
    });
  });

  test('keeps only the exercise fields the editor needs', () => {
    const state = createReducer()(initialWorkoutEditorState, {
      type: 'exercisesAdded',
      exercises: [{ ...plank, bodyPart: 'core', createdAt: '2026-10-04T14:30:00Z' } as EditorExercise],
    });
    expect(state.items[0].exercise).toEqual(plank);
  });

  test('appends after the items already in the workout', () => {
    const reducer = createReducer();
    const firstState = reducer(initialWorkoutEditorState, { type: 'exercisesAdded', exercises: [benchPress] });
    const state = reducer(firstState, { type: 'exercisesAdded', exercises: [plank, rowing] });
    expect(state.items.map((item) => item.exercise.id)).toEqual([3, 5, 8]);
    expect(state.items[0]).toBe(firstState.items[0]);
  });
});

describe('trackingTypeChanged', () => {
  test('keeps the number of sets and clears the fields the new type does not track', () => {
    const { reducer, state, itemKey, targetSetKey } = stateWithBenchPress();
    const filledState = reducer(
      reducer(state, {
        type: 'targetSetChanged',
        itemKey,
        targetSetKey,
        changes: { weightKilograms: 60, repetitions: 10 },
      }),
      { type: 'targetSetAdded', itemKey },
    );
    const changedState = reducer(filledState, { type: 'trackingTypeChanged', itemKey, trackingType: 'duration' });
    expect(changedState.items[0].trackingType).toBe('duration');
    expect(changedState.items[0].targetSets).toHaveLength(2);
    expect(changedState.items[0].targetSets[0]).toEqual({
      key: targetSetKey,
      repetitions: null,
      weightKilograms: null,
      durationSeconds: null,
      distanceMeters: null,
    });
  });

  test('keeps the fields both tracking types share', () => {
    const { reducer, state, itemKey, targetSetKey } = stateWithBenchPress();
    const filledState = reducer(state, {
      type: 'targetSetChanged',
      itemKey,
      targetSetKey,
      changes: { weightKilograms: 60, repetitions: 10 },
    });
    const changedState = reducer(filledState, { type: 'trackingTypeChanged', itemKey, trackingType: 'repetitions' });
    expect(changedState.items[0].targetSets[0]).toMatchObject({ repetitions: 10, weightKilograms: null });
  });

  test('changes only the item it names', () => {
    const reducer = createReducer();
    const state = reducer(initialWorkoutEditorState, { type: 'exercisesAdded', exercises: [benchPress, plank] });
    const changedState = reducer(state, {
      type: 'trackingTypeChanged',
      itemKey: state.items[1].key,
      trackingType: 'repetitions',
    });
    expect(changedState.items[0]).toBe(state.items[0]);
    expect(changedState.items[1].trackingType).toBe('repetitions');
  });
});

describe('targetSetAdded', () => {
  test('copies the previous set with a new key', () => {
    const { reducer, state, itemKey, targetSetKey } = stateWithBenchPress();
    const filledState = reducer(state, {
      type: 'targetSetChanged',
      itemKey,
      targetSetKey,
      changes: { weightKilograms: 60, repetitions: 12 },
    });
    const addedState = reducer(filledState, { type: 'targetSetAdded', itemKey });
    expect(addedState.items[0].targetSets).toEqual([
      { key: targetSetKey, repetitions: 12, weightKilograms: 60, durationSeconds: null, distanceMeters: null },
      { key: 'test-3', repetitions: 12, weightKilograms: 60, durationSeconds: null, distanceMeters: null },
    ]);
  });

  test('copies the last set when there are several', () => {
    const { reducer, state, itemKey } = stateWithBenchPress();
    const twoSetState = reducer(state, { type: 'targetSetAdded', itemKey });
    const lastTargetSetKey = twoSetState.items[0].targetSets[1].key;
    const changedState = reducer(twoSetState, {
      type: 'targetSetChanged',
      itemKey,
      targetSetKey: lastTargetSetKey,
      changes: { repetitions: 8 },
    });
    const addedState = reducer(changedState, { type: 'targetSetAdded', itemKey });
    expect(addedState.items[0].targetSets.map((targetSet) => targetSet.repetitions)).toEqual([null, 8, 8]);
  });

  test('adds an empty set when the item has no sets', () => {
    const { reducer, state, itemKey, targetSetKey } = stateWithBenchPress();
    const emptyState = reducer(state, { type: 'targetSetRemoved', itemKey, targetSetKey });
    const addedState = reducer(emptyState, { type: 'targetSetAdded', itemKey });
    expect(addedState.items[0].targetSets).toEqual([
      { key: 'test-3', repetitions: null, weightKilograms: null, durationSeconds: null, distanceMeters: null },
    ]);
  });
});

describe('targetSetRemoved', () => {
  test('removes only the set it names', () => {
    const { reducer, state, itemKey, targetSetKey } = stateWithBenchPress();
    const twoSetState = reducer(state, { type: 'targetSetAdded', itemKey });
    const removedState = reducer(twoSetState, { type: 'targetSetRemoved', itemKey, targetSetKey });
    expect(removedState.items[0].targetSets.map((targetSet) => targetSet.key)).toEqual(['test-3']);
    expect(removedState.hasUnsavedChanges).toBe(true);
  });
});

describe('targetSetChanged', () => {
  test('merges the changed fields into the set it names', () => {
    const { reducer, state, itemKey } = stateWithBenchPress();
    const twoSetState = reducer(state, { type: 'targetSetAdded', itemKey });
    const secondTargetSetKey = twoSetState.items[0].targetSets[1].key;
    const changedState = reducer(twoSetState, {
      type: 'targetSetChanged',
      itemKey,
      targetSetKey: secondTargetSetKey,
      changes: { weightKilograms: 62.5 },
    });
    expect(changedState.items[0].targetSets[0]).toBe(twoSetState.items[0].targetSets[0]);
    expect(changedState.items[0].targetSets[1]).toMatchObject({ weightKilograms: 62.5, repetitions: null });
  });

  test('clearing a field stores null', () => {
    const { reducer, state, itemKey, targetSetKey } = stateWithBenchPress();
    const filledState = reducer(state, { type: 'targetSetChanged', itemKey, targetSetKey, changes: { repetitions: 10 } });
    const clearedState = reducer(filledState, {
      type: 'targetSetChanged',
      itemKey,
      targetSetKey,
      changes: { repetitions: null },
    });
    expect(clearedState.items[0].targetSets[0].repetitions).toBeNull();
  });
});
