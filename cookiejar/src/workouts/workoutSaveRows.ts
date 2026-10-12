import { imageUrlToStore } from '@/images/imageUrls';
import { stripSwimKeys } from '@/swimming/swimEditorReducer';
import type { SwimSection } from '@/swimming/swimTypes';
import type { ActivityType } from '@/types/ActivityType';
import type { ClassType } from '@/types/ClassType';
import type { TrackingType } from '@/types/TrackingType';
import { defaultSwimPoolLength } from '@/types/SwimPoolLength';
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
  poolLengthMeters: number | null;
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
  swimSections: SwimSection[];
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
        poolLengthMeters: null,
        description: textToStore(classDetails.description),
        imageUrl: imageUrlToStore(classDetails.imageUrl),
      },
      items: [],
      swimSections: [],
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
        poolLengthMeters: null,
        description: textToStore(activityDetails.description),
        imageUrl: imageUrlToStore(activityDetails.imageUrl),
      },
      items: [],
      swimSections: [],
    };
  }

  if (state.kind === 'swim') {
    const swimDetails = state.swimDetails;
    return {
      workoutId: state.workoutId,
      workout: {
        name,
        kind: 'swim',
        classType: null,
        activityType: null,
        durationMinutes: null,
        poolLengthMeters: swimDetails?.poolLengthMeters ?? defaultSwimPoolLength,
        description: textToStore(swimDetails?.description ?? ''),
        imageUrl: imageUrlToStore(swimDetails?.imageUrl ?? ''),
      },
      items: [],
      swimSections: swimDetails === null ? [] : stripSwimKeys(swimDetails),
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
      poolLengthMeters: null,
      description: null,
      imageUrl: null,
    },
    items: state.items.map(toItemSaveRow),
    swimSections: [],
  };
}
