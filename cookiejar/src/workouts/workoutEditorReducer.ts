import type { ClassType } from '@/types/ClassType';
import type { Exercise } from '@/types/Exercise';
import type { TrackingType } from '@/types/TrackingType';
import type { WorkoutKind } from '@/types/WorkoutKind';

export type EditorTargetSet = {
  key: string;
  repetitions: number | null;
  weightKilograms: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
};

export type EditorItem = {
  key: string;
  exercise: Pick<Exercise, 'id' | 'name' | 'imageUrl' | 'defaultTrackingType'>;
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

export function createWorkoutEditorReducer(createKey: CreateKey) {
  function loadItem(loadedItem: LoadedItem): EditorItem {
    return {
      ...loadedItem,
      key: createKey(),
      targetSets: loadedItem.targetSets.map((loadedTargetSet) => ({ ...loadedTargetSet, key: createKey() })),
    };
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
