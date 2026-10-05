import type { WorkoutWithItems } from '@/types/WorkoutWithItems';
import { defaultClassDetails, type LoadedWorkout } from '@/workouts/workoutEditorReducer';

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
      items: [],
    };
  }

  return {
    workoutId: workout.id,
    name: workout.name,
    kind: 'individual',
    classDetails: null,
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
