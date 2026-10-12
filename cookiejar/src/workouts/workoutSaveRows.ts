import { imageUrlToStore } from '@/images/imageUrls';
import type { ActivityType } from '@/types/ActivityType';
import type { ClassType } from '@/types/ClassType';
import type { TrackingType } from '@/types/TrackingType';
import type { WorkoutKind } from '@/types/WorkoutKind';
import {
  defaultActivityDetails,
  defaultClassDetails,
  type EditorItem,
  type WorkoutEditorState,
} from '@/workouts/workoutEditorReducer';

export type WorkoutSaveRow = {
  name: string;
  kind: WorkoutKind;
  classType: ClassType | null;
  activityType: ActivityType | null;
  durationMinutes: number | null;
  description: string | null;
  imageUrl: string | null;
};

export type TargetSetSaveRow = {
  position: number;
  repetitions: number | null;
  weightKilograms: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
};

export type WorkoutItemSaveRow = {
  exerciseId: number;
  position: number;
  supersetGroup: string | null;
  trackingType: TrackingType;
  restSeconds: number | null;
  targetSets: TargetSetSaveRow[];
};

export type WorkoutSaveRows = {
  workoutId: number | null;
  workout: WorkoutSaveRow;
  items: WorkoutItemSaveRow[];
};

function textToStore(text: string) {
  const trimmedText = text.trim();
  return trimmedText.length === 0 ? null : trimmedText;
}

function toItemSaveRow(item: EditorItem, position: number): WorkoutItemSaveRow {
  return {
    exerciseId: item.exercise.id,
    position,
    supersetGroup: item.supersetGroup,
    trackingType: item.trackingType,
    restSeconds: item.restSeconds,
    targetSets: item.targetSets.map((targetSet, targetSetPosition) => ({
      position: targetSetPosition,
      repetitions: targetSet.repetitions,
      weightKilograms: targetSet.weightKilograms,
      durationSeconds: targetSet.durationSeconds,
      distanceMeters: targetSet.distanceMeters,
    })),
  };
}

export function toWorkoutSaveRows(state: WorkoutEditorState): WorkoutSaveRows {
  const name = state.name.trim();

  if (state.kind === 'class') {
    const classDetails = state.classDetails ?? defaultClassDetails;
    return {
      workoutId: state.workoutId,
      workout: {
        name,
        kind: 'class',
        classType: classDetails.classType,
        activityType: null,
        durationMinutes: classDetails.durationMinutes,
        description: textToStore(classDetails.description),
        imageUrl: imageUrlToStore(classDetails.imageUrl),
      },
      items: [],
    };
  }

  if (state.kind === 'activity') {
    const activityDetails = state.activityDetails ?? defaultActivityDetails;
    return {
      workoutId: state.workoutId,
      workout: {
        name,
        kind: 'activity',
        classType: null,
        activityType: activityDetails.activityType,
        durationMinutes: null,
        description: textToStore(activityDetails.description),
        imageUrl: imageUrlToStore(activityDetails.imageUrl),
      },
      items: [],
    };
  }

  return {
    workoutId: state.workoutId,
    workout: {
      name,
      kind: 'individual',
      classType: null,
      activityType: null,
      durationMinutes: null,
      description: null,
      imageUrl: null,
    },
    items: state.items.map(toItemSaveRow),
  };
}
