import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';

import {
  countPlansUsingWorkout,
  deleteWorkout,
  duplicateWorkout,
} from '@/database/repositories/workoutRepository';
import type { WorkoutSummary } from '@/types/WorkoutSummary';

type UseWorkoutActionsOptions = {
  reloadWorkouts: () => Promise<void>;
};

function describePlanUsage(planCount: number) {
  if (planCount === 0) {
    return "This can't be undone.";
  }
  if (planCount === 1) {
    return 'Used in 1 plan — it will be removed from it';
  }
  return `Used in ${planCount} plans — it will be removed from them`;
}

export function useWorkoutActions({ reloadWorkouts }: UseWorkoutActionsOptions) {
  const database = useSQLiteContext();

  const showFailure = (title: string) => {
    Alert.alert(title, 'Something went wrong. Please try again.');
  };

  const editWorkout = (workout: WorkoutSummary) => {
    router.push({ pathname: '/workouts/[workoutId]/edit', params: { workoutId: String(workout.id) } });
  };

  const duplicate = async (workout: WorkoutSummary) => {
    try {
      await duplicateWorkout(database, workout.id);
      await reloadWorkouts();
    } catch {
      showFailure('Could not duplicate the workout');
    }
  };

  const confirmDelete = async (workout: WorkoutSummary) => {
    try {
      const planCount = await countPlansUsingWorkout(database, workout.id);
      Alert.alert(`Delete "${workout.name}"?`, describePlanUsage(planCount), [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkout(database, workout.id);
              await reloadWorkouts();
            } catch {
              showFailure('Could not delete the workout');
            }
          },
        },
      ]);
    } catch {
      showFailure('Could not delete the workout');
    }
  };

  return { editWorkout, duplicateWorkout: duplicate, confirmDeleteWorkout: confirmDelete };
}
