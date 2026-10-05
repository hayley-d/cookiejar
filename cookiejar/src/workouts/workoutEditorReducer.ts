import type { ClassType } from '@/types/ClassType';
import type { Exercise } from '@/types/Exercise';
import type { TrackingType } from '@/types/TrackingType';
import type { WorkoutKind } from '@/types/WorkoutKind';
import {
  clearUntrackedFields,
  emptyTargetSetValues,
  type TargetSetValues,
} from '@/workouts/targetSetColumns';

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

export type ClassDetails = {
  classType: ClassType;
  durationMinutes: number;
  description: string;
  imageUrl: string;
};

export type WorkoutEditorState = {
  workoutId: number | null;
  name: string;
  kind: WorkoutKind;
  classDetails: ClassDetails | null;
  items: EditorItem[];
  hasUnsavedChanges: boolean;
};

export type LoadedTargetSet = Omit<EditorTargetSet, 'key'>;

export type LoadedItem = Omit<EditorItem, 'key' | 'targetSets'> & {
  targetSets: LoadedTargetSet[];
};

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
  | { type: 'exercisesAdded'; exercises: EditorExercise[] }
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
      exercise: {
        id: exercise.id,
        name: exercise.name,
        imageUrl: exercise.imageUrl,
        defaultTrackingType: exercise.defaultTrackingType,
      },
      trackingType: exercise.defaultTrackingType,
      supersetGroup: null,
      restSeconds: null,
      targetSets: [{ ...emptyTargetSetValues, key: createKey() }],
    };
  }

  function copyLastTargetSet(targetSets: EditorTargetSet[]): EditorTargetSet {
    return { ...emptyTargetSetValues, ...targetSets.at(-1), key: createKey() };
  }

  return function workoutEditorReducer(state: WorkoutEditorState, action: WorkoutEditorAction): WorkoutEditorState {
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
      case 'exercisesAdded':
        return {
          ...state,
          items: [...state.items, ...action.exercises.map(createItem)],
          hasUnsavedChanges: true,
        };
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
  };
}
