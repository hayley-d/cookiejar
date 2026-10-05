import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { TextButton } from '@/components/atoms/TextButton';
import { EmptyState } from '@/components/molecules/EmptyState';
import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';
import { useWorkoutWithItems } from '@/hooks/useWorkoutWithItems';
import { toLoadedWorkout } from '@/workouts/toLoadedWorkout';
import ClassDetailsScreen from '../class-details';
import WorkoutEditorScreen from '../editor';

type EditWorkoutParameters = {
  workoutId: string;
};

export default function EditWorkoutScreen() {
  const { workoutId: workoutIdParameter } = useLocalSearchParams<EditWorkoutParameters>();
  const workoutId = Number(workoutIdParameter);
  const workoutLookup = useWorkoutWithItems(workoutId);
  const { state, dispatch } = useWorkoutEditor();

  useEffect(() => {
    if (workoutLookup.status === 'found' && state.workoutId !== workoutId) {
      dispatch({ type: 'loaded', workout: toLoadedWorkout(workoutLookup.workout) });
    }
  }, [dispatch, state.workoutId, workoutId, workoutLookup]);

  const closeButton = <TextButton label="Cancel" onPress={() => router.back()} />;

  if (workoutLookup.status === 'missing' || workoutLookup.status === 'failed') {
    return (
      <>
        <Stack.Screen options={{ headerLeft: () => closeButton }} />
        <EmptyState
          nuggie="workout"
          title={workoutLookup.status === 'missing' ? 'Workout not found' : 'Could not open the workout'}
          message={
            workoutLookup.status === 'missing'
              ? 'This workout may have been deleted.'
              : 'Something went wrong while loading it. Please try again.'
          }
          actionLabel="Close"
          onAction={() => router.back()}
        />
      </>
    );
  }

  if (workoutLookup.status === 'loading' || state.workoutId !== workoutId) {
    return <Stack.Screen options={{ headerLeft: () => closeButton }} />;
  }

  return (
    <>
      <Stack.Screen options={{ headerLeft: () => closeButton }} />
      {state.kind === 'class' ? <ClassDetailsScreen /> : <WorkoutEditorScreen />}
    </>
  );
}
