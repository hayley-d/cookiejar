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
  const state = reducer(initialWorkoutEditorState, {
    type: 'exercisesAdded',
    exercises: [benchPress],
    asSuperset: false,
  });
  return { reducer, state, itemKey: state.items[0].key, targetSetKey: state.items[0].targetSets[0].key };
}

describe('exercisesAdded', () => {
  test('adds one item per exercise in the order given', () => {
    const state = createReducer()(initialWorkoutEditorState, {
      type: 'exercisesAdded',
      exercises: [plank, benchPress, rowing],
      asSuperset: false,
    });
    expect(state.items.map((item) => item.exercise.name)).toEqual(['Plank', 'Bench Press', 'Rowing']);
    expect(state.hasUnsavedChanges).toBe(true);
  });

  test('a new item uses the default tracking type and starts with one empty set', () => {
    const state = createReducer()(initialWorkoutEditorState, {
      type: 'exercisesAdded',
      exercises: [benchPress],
      asSuperset: false,
    });
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
      asSuperset: false,
    });
    expect(state.items[0].exercise).toEqual(plank);
  });

  test('appends after the items already in the workout', () => {
    const reducer = createReducer();
    const firstState = reducer(initialWorkoutEditorState, {
      type: 'exercisesAdded',
      exercises: [benchPress],
      asSuperset: false,
    });
    const state = reducer(firstState, { type: 'exercisesAdded', exercises: [plank, rowing], asSuperset: false });
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
    const state = reducer(initialWorkoutEditorState, {
      type: 'exercisesAdded',
      exercises: [benchPress, plank],
      asSuperset: false,
    });
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
    const filledState = reducer(state, {
      type: 'targetSetChanged',
      itemKey,
      targetSetKey,
      changes: { repetitions: 10 },
    });
    const clearedState = reducer(filledState, {
      type: 'targetSetChanged',
      itemKey,
      targetSetKey,
      changes: { repetitions: null },
    });
    expect(clearedState.items[0].targetSets[0].repetitions).toBeNull();
  });
});

function stateWithThreeItems() {
  const reducer = createReducer();
  const state = reducer(initialWorkoutEditorState, {
    type: 'exercisesAdded',
    exercises: [benchPress, plank, rowing],
    asSuperset: false,
  });
  return { reducer, state, keys: state.items.map((item) => item.key) };
}

function groupsOf(state: WorkoutEditorState) {
  return state.items.map((item) => item.supersetGroup);
}

describe('exercisesAdded as a superset', () => {
  test('appended picks share one new group, lettered after the existing groups', () => {
    const { reducer, state, keys } = stateWithThreeItems();
    const linkedState = reducer(state, { type: 'supersetCreated', itemKey: keys[0] });
    const nextState = reducer(linkedState, {
      type: 'exercisesAdded',
      exercises: [
        { ...plank, id: 11 },
        { ...rowing, id: 12 },
      ],
      asSuperset: true,
    });
    expect(groupsOf(nextState)).toEqual(['A', 'A', null, 'B', 'B']);
  });

  test('a single pick as a superset stays ungrouped', () => {
    const state = createReducer()(initialWorkoutEditorState, {
      type: 'exercisesAdded',
      exercises: [benchPress],
      asSuperset: true,
    });
    expect(groupsOf(state)).toEqual([null]);
  });
});

describe('supersetCreated', () => {
  test('links a card with the card below it', () => {
    const { reducer, state, keys } = stateWithThreeItems();
    const nextState = reducer(state, { type: 'supersetCreated', itemKey: keys[0] });
    expect(groupsOf(nextState)).toEqual(['A', 'A', null]);
    expect(nextState.hasUnsavedChanges).toBe(true);
  });

  test('repeating it on the next card makes a tri-set', () => {
    const { reducer, state, keys } = stateWithThreeItems();
    const linkedState = reducer(state, { type: 'supersetCreated', itemKey: keys[0] });
    const nextState = reducer(linkedState, { type: 'supersetCreated', itemKey: keys[1] });
    expect(groupsOf(nextState)).toEqual(['A', 'A', 'A']);
  });

  test('linking into a group below merges the two groups', () => {
    const { reducer, state, keys } = stateWithThreeItems();
    const withFourth = reducer(state, {
      type: 'exercisesAdded',
      exercises: [{ ...plank, id: 11 }],
      asSuperset: false,
    });
    const linkedLowerState = reducer(withFourth, { type: 'supersetCreated', itemKey: keys[1] });
    const nextState = reducer(linkedLowerState, { type: 'supersetCreated', itemKey: keys[0] });
    expect(groupsOf(nextState)).toEqual(['A', 'A', 'A', null]);
  });

  test('does nothing on the last card', () => {
    const { reducer, state, keys } = stateWithThreeItems();
    expect(reducer(state, { type: 'supersetCreated', itemKey: keys[2] })).toBe(state);
  });
});

describe('supersetRemoved', () => {
  test('unlinking a two-card superset clears the group', () => {
    const { reducer, state, keys } = stateWithThreeItems();
    const linkedState = reducer(state, { type: 'supersetCreated', itemKey: keys[0] });
    const nextState = reducer(linkedState, { type: 'supersetRemoved', itemKey: keys[0] });
    expect(groupsOf(nextState)).toEqual([null, null, null]);
  });

  test('unlinking the first card of a tri-set leaves the other two linked', () => {
    const { reducer, state, keys } = stateWithThreeItems();
    const linkedState = reducer(reducer(state, { type: 'supersetCreated', itemKey: keys[0] }), {
      type: 'supersetCreated',
      itemKey: keys[1],
    });
    const nextState = reducer(linkedState, { type: 'supersetRemoved', itemKey: keys[0] });
    expect(groupsOf(nextState)).toEqual([null, 'A', 'A']);
  });

  test('unlinking the middle card of a tri-set leaves the first two linked', () => {
    const { reducer, state, keys } = stateWithThreeItems();
    const linkedState = reducer(reducer(state, { type: 'supersetCreated', itemKey: keys[0] }), {
      type: 'supersetCreated',
      itemKey: keys[1],
    });
    const nextState = reducer(linkedState, { type: 'supersetRemoved', itemKey: keys[1] });
    expect(groupsOf(nextState)).toEqual(['A', 'A', null]);
  });

  test('does nothing on a card that is not in a superset', () => {
    const { reducer, state, keys } = stateWithThreeItems();
    expect(reducer(state, { type: 'supersetRemoved', itemKey: keys[0] })).toBe(state);
  });
});

describe('itemRemoved', () => {
  test('removes the named card and keeps the others in order', () => {
    const { reducer, state, keys } = stateWithThreeItems();
    const nextState = reducer(state, { type: 'itemRemoved', itemKey: keys[1] });
    expect(nextState.items.map((item) => item.exercise.id)).toEqual([3, 8]);
    expect(nextState.hasUnsavedChanges).toBe(true);
  });

  test('removing a member of a two-card superset clears the leftover group', () => {
    const { reducer, state, keys } = stateWithThreeItems();
    const linkedState = reducer(state, { type: 'supersetCreated', itemKey: keys[0] });
    const nextState = reducer(linkedState, { type: 'itemRemoved', itemKey: keys[1] });
    expect(groupsOf(nextState)).toEqual([null, null]);
  });

  test('removing a member of a tri-set keeps the other two linked', () => {
    const { reducer, state, keys } = stateWithThreeItems();
    const linkedState = reducer(reducer(state, { type: 'supersetCreated', itemKey: keys[0] }), {
      type: 'supersetCreated',
      itemKey: keys[1],
    });
    const nextState = reducer(linkedState, { type: 'itemRemoved', itemKey: keys[1] });
    expect(groupsOf(nextState)).toEqual(['A', 'A']);
  });

  test('removing an earlier superset reletters the later one', () => {
    const { reducer, state, keys } = stateWithThreeItems();
    const withFiveItems = reducer(state, {
      type: 'exercisesAdded',
      exercises: [
        { ...plank, id: 11 },
        { ...rowing, id: 12 },
      ],
      asSuperset: true,
    });
    const linkedState = reducer(withFiveItems, { type: 'supersetCreated', itemKey: keys[0] });
    expect(groupsOf(linkedState)).toEqual(['A', 'A', null, 'B', 'B']);
    const nextState = reducer(linkedState, { type: 'itemRemoved', itemKey: keys[0] });
    expect(groupsOf(nextState)).toEqual([null, null, 'A', 'A']);
  });
});

describe('loaded supersets', () => {
  test('keeps saved groups and relettering leaves them alone', () => {
    const state = createReducer()(initialWorkoutEditorState, {
      type: 'loaded',
      workout: {
        ...loadedIndividualWorkout,
        items: loadedIndividualWorkout.items.map((item) => ({ ...item, supersetGroup: 'A' })),
      },
    });
    expect(groupsOf(state)).toEqual(['A', 'A']);
    expect(state.hasUnsavedChanges).toBe(false);
  });
});
