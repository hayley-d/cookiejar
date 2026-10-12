import { defaultSwimPoolLength } from '@/types/SwimPoolLength';
import type { WorkoutWithItems } from '@/types/WorkoutWithItems';
import { defaultActivityDetails, defaultClassDetails, type LoadedWorkout } from '@/workouts/workoutEditorReducer';

export function toLoadedWorkout(workout: WorkoutWithItems): LoadedWorkout {
  if (workout.kind === 'class') {
    return {
      workoutId: workout.id,
      name: workout.name,
      kind: 'class',
      classDetails: {
        classType: workout.classType ?? defaultClassDetails.classType,
        durationMinutes: workout.durationMinutes ?? defaultClassDetails.durationMinutes,
        description: workout.description ?? '',
        imageUrl: workout.imageUrl ?? '',
      },
      activityDetails: null,
      swimDetails: null,
      items: [],
    };
  }

  if (workout.kind === 'activity') {
    return {
      workoutId: workout.id,
      name: workout.name,
      kind: 'activity',
      classDetails: null,
      activityDetails: {
        activityType: workout.activityType ?? defaultActivityDetails.activityType,
        description: workout.description ?? '',
        imageUrl: workout.imageUrl ?? '',
      },
      swimDetails: null,
      items: [],
    };
  }

  if (workout.kind === 'swim') {
    return {
      workoutId: workout.id,
      name: workout.name,
      kind: 'swim',
      classDetails: null,
      activityDetails: null,
      swimDetails: {
        poolLengthMeters: workout.swim?.poolLengthMeters ?? defaultSwimPoolLength,
        description: workout.description ?? '',
        imageUrl: workout.imageUrl ?? '',
        sections: workout.swim?.sections ?? [],
      },
      items: [],
    };
  }

  return {
    workoutId: workout.id,
    name: workout.name,
    kind: 'individual',
    classDetails: null,
    activityDetails: null,
    swimDetails: null,
    items: workout.items.map((item) => ({
      exercise: {
        id: item.exercise.id,
        name: item.exercise.name,
        imageUrl: item.exercise.imageUrl,
        defaultTrackingType: item.exercise.defaultTrackingType,
      },
      trackingType: item.trackingType,
      supersetGroup: item.supersetGroup,
      restSeconds: item.restSeconds,
      targetSets: item.targetSets.map((targetSet) => ({
        repetitions: targetSet.repetitions,
        weightKilograms: targetSet.weightKilograms,
        durationSeconds: targetSet.durationSeconds,
        distanceMeters: targetSet.distanceMeters,
      })),
    })),
  };
}
