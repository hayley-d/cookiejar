import type { ClassType } from '@/types/ClassType';
import type { Exercise } from '@/types/Exercise';
import type { TrackingType } from '@/types/TrackingType';
import type { WorkoutKind } from '@/types/WorkoutKind';
import { normaliseSupersets } from '@/workouts/normaliseSupersets';
import { clearUntrackedFields, emptyTargetSetValues, type TargetSetValues } from '@/workouts/targetSetColumns';

export type EditorTargetSet = {
  key: string;
  repetitions: number | null;
  weightKilograms: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
};

export type EditorExercise = Pick<Exercise, 'id' | 'name' | 'imageUrl' | 'defaultTrackingType'>;

export type EditorItem = {
  key: string;
  exercise: EditorExercise;
  trackingType: TrackingType;
  supersetGroup: string | null;
  restSeconds: number | null;
  targetSets: EditorTargetSet[];
};

export type ClassDetails = { classType: ClassType; durationMinutes: number; description: string; imageUrl: string };

export type WorkoutEditorState = {
  workoutId: number | null;
  name: string;
  kind: WorkoutKind;
  classDetails: ClassDetails | null;
  items: EditorItem[];
  hasUnsavedChanges: boolean;
};

export type LoadedTargetSet = Omit<EditorTargetSet, 'key'>;

export type LoadedItem = Omit<EditorItem, 'key' | 'targetSets'> & { targetSets: LoadedTargetSet[] };

export type LoadedWorkout = {
  workoutId: number;
  name: string;
  kind: WorkoutKind;
  classDetails: ClassDetails | null;
  items: LoadedItem[];
};

export type WorkoutEditorAction =
  | { type: 'renamed'; name: string }
  | { type: 'kindChosen'; kind: WorkoutKind }
  | { type: 'classDetailsChanged'; changes: Partial<ClassDetails> }
  | { type: 'exercisesAdded'; exercises: EditorExercise[]; asSuperset: boolean }
  | { type: 'itemRemoved'; itemKey: string }
  | { type: 'supersetCreated'; itemKey: string }
  | { type: 'supersetRemoved'; itemKey: string }
  | { type: 'exerciseReplaced'; itemKey: string; exercise: EditorExercise }
  | { type: 'restChanged'; itemKey: string; restSeconds: number | null }
  | { type: 'trackingTypeChanged'; itemKey: string; trackingType: TrackingType }
  | { type: 'targetSetAdded'; itemKey: string }
  | { type: 'targetSetRemoved'; itemKey: string; targetSetKey: string }
  | { type: 'targetSetChanged'; itemKey: string; targetSetKey: string; changes: Partial<TargetSetValues> }
  | { type: 'loaded'; workout: LoadedWorkout };

export type CreateKey = () => string;

export const defaultClassDetails: ClassDetails = {
  classType: 'yoga',
  durationMinutes: 45,
  description: '',
  imageUrl: '',
};

export const initialWorkoutEditorState: WorkoutEditorState = {
  workoutId: null,
  name: '',
  kind: 'individual',
  classDetails: null,
  items: [],
  hasUnsavedChanges: false,
};

export function createKeyCounter(prefix: string): CreateKey {
  let keyCount = 0;
  return () => {
    keyCount += 1;
    return `${prefix}-${keyCount}`;
  };
}

function updateItem(
  state: WorkoutEditorState,
  itemKey: string,
  update: (item: EditorItem) => EditorItem,
): WorkoutEditorState {
  return {
    ...state,
    items: state.items.map((item) => (item.key === itemKey ? update(item) : item)),
    hasUnsavedChanges: true,
  };
}

function toEditorExercise(exercise: EditorExercise): EditorExercise {
  return {
    id: exercise.id,
    name: exercise.name,
    imageUrl: exercise.imageUrl,
    defaultTrackingType: exercise.defaultTrackingType,
  };
}

export function createWorkoutEditorReducer(createKey: CreateKey) {
  function loadItem(loadedItem: LoadedItem): EditorItem {
    return {
      ...loadedItem,
      key: createKey(),
      targetSets: loadedItem.targetSets.map((loadedTargetSet) => ({ ...loadedTargetSet, key: createKey() })),
    };
  }

  function createItem(exercise: EditorExercise): EditorItem {
    return {
      key: createKey(),
      exercise: toEditorExercise(exercise),
      trackingType: exercise.defaultTrackingType,
      supersetGroup: null,
      restSeconds: null,
      targetSets: [{ ...emptyTargetSetValues, key: createKey() }],
    };
  }

  function copyLastTargetSet(targetSets: EditorTargetSet[]): EditorTargetSet {
    return { ...emptyTargetSetValues, ...targetSets.at(-1), key: createKey() };
  }

  function applyAction(state: WorkoutEditorState, action: WorkoutEditorAction): WorkoutEditorState {
    switch (action.type) {
      case 'renamed':
        return { ...state, name: action.name, hasUnsavedChanges: true };
      case 'kindChosen':
        return {
          ...state,
          kind: action.kind,
          classDetails: action.kind === 'class' ? (state.classDetails ?? defaultClassDetails) : null,
          hasUnsavedChanges: true,
        };
      case 'classDetailsChanged':
        return {
          ...state,
          classDetails: { ...(state.classDetails ?? defaultClassDetails), ...action.changes },
          hasUnsavedChanges: true,
        };
      case 'exercisesAdded': {
        const supersetGroup = action.asSuperset ? createKey() : null;
        return {
          ...state,
          items: [...state.items, ...action.exercises.map((exercise) => ({ ...createItem(exercise), supersetGroup }))],
          hasUnsavedChanges: true,
        };
      }
      case 'itemRemoved':
        return { ...state, items: state.items.filter((item) => item.key !== action.itemKey), hasUnsavedChanges: true };
      case 'supersetCreated': {
        const itemIndex = state.items.findIndex((item) => item.key === action.itemKey);
        const nextItem = state.items[itemIndex + 1];
        if (itemIndex === -1 || nextItem === undefined) {
          return state;
        }
        const supersetGroup = state.items[itemIndex].supersetGroup ?? createKey();
        const replacedGroup = nextItem.supersetGroup;
        return {
          ...state,
          items: state.items.map((item, index) =>
            index === itemIndex ||
            index === itemIndex + 1 ||
            (replacedGroup !== null && item.supersetGroup === replacedGroup)
              ? { ...item, supersetGroup }
              : item,
          ),
          hasUnsavedChanges: true,
        };
      }
      case 'supersetRemoved': {
        const itemIndex = state.items.findIndex((item) => item.key === action.itemKey);
        const supersetGroup = state.items[itemIndex]?.supersetGroup ?? null;
        if (supersetGroup === null) {
          return state;
        }
        const detachedGroup = createKey();
        let isDetaching = true;
        return {
          ...state,
          items: state.items.map((item, index) => {
            if (index <= itemIndex || !isDetaching) {
              return item;
            }
            if (item.supersetGroup !== supersetGroup) {
              isDetaching = false;
              return item;
            }
            return { ...item, supersetGroup: detachedGroup };
          }),
          hasUnsavedChanges: true,
        };
      }
      case 'exerciseReplaced': {
        const replacedItem = state.items.find((item) => item.key === action.itemKey);
        if (replacedItem === undefined || replacedItem.exercise.id === action.exercise.id) {
          return state;
        }
        return updateItem(state, action.itemKey, (item) => ({ ...item, exercise: toEditorExercise(action.exercise) }));
      }
      case 'restChanged': {
        const restItem = state.items.find((item) => item.key === action.itemKey);
        if (restItem === undefined || restItem.restSeconds === action.restSeconds) {
          return state;
        }
        return updateItem(state, action.itemKey, (item) => ({ ...item, restSeconds: action.restSeconds }));
      }
      case 'trackingTypeChanged':
        return updateItem(state, action.itemKey, (item) => ({
          ...item,
          trackingType: action.trackingType,
          targetSets: item.targetSets.map((targetSet) => clearUntrackedFields(targetSet, action.trackingType)),
        }));
      case 'targetSetAdded':
        return updateItem(state, action.itemKey, (item) => ({
          ...item,
          targetSets: [...item.targetSets, copyLastTargetSet(item.targetSets)],
        }));
      case 'targetSetRemoved':
        return updateItem(state, action.itemKey, (item) => ({
          ...item,
          targetSets: item.targetSets.filter((targetSet) => targetSet.key !== action.targetSetKey),
        }));
      case 'targetSetChanged':
        return updateItem(state, action.itemKey, (item) => ({
          ...item,
          targetSets: item.targetSets.map((targetSet) =>
            targetSet.key === action.targetSetKey ? { ...targetSet, ...action.changes } : targetSet,
          ),
        }));
      case 'loaded':
        return {
          workoutId: action.workout.workoutId,
          name: action.workout.name,
          kind: action.workout.kind,
          classDetails: action.workout.classDetails,
          items: action.workout.items.map(loadItem),
          hasUnsavedChanges: false,
        };
    }
  }

  return function workoutEditorReducer(state: WorkoutEditorState, action: WorkoutEditorAction): WorkoutEditorState {
    const nextState = applyAction(state, action);
    return nextState === state ? state : { ...nextState, items: normaliseSupersets(nextState.items) };
  };
}
