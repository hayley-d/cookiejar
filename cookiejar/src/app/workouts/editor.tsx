import { Stack } from 'expo-router';

import { EmptyState } from '@/components/molecules/EmptyState';
import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';

export default function WorkoutEditorScreen() {
  const { state } = useWorkoutEditor();

  return (
    <>
      <Stack.Screen options={{ title: state.name.trim() }} />
      <EmptyState
        nuggie="workout"
        title="Individual workouts are on the way"
        message="Picking exercises, sets and reps comes in the next update. Go back and choose Class to save one now."
      />
    </>
  );
}
