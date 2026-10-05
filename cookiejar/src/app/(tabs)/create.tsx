import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateHub, type CreateHubToast } from '@/components/organisms/CreateHub';
import { Box } from '@/components/primitives/Box';
import { useWorkoutActions } from '@/hooks/useWorkoutActions';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useWorkoutSavedNoticeOnFocus } from '@/hooks/useWorkoutSavedNoticeOnFocus';
import type { WorkoutSavedNotice } from '@/stores/workoutSavedStore';

const coachButtonClearance = 96;

export default function CreateScreen() {
  const { workouts, reloadWorkouts } = useWorkouts();
  const { editWorkout, duplicateWorkout, confirmDeleteWorkout } = useWorkoutActions({ reloadWorkouts });
  const savedNotice = useWorkoutSavedNoticeOnFocus();
  const [lastSavedNotice, setLastSavedNotice] = useState<WorkoutSavedNotice | null>(null);
  const [toastCount, setToastCount] = useState(0);
  const [toast, setToast] = useState<CreateHubToast | null>(null);

  if (savedNotice !== null && savedNotice !== lastSavedNotice) {
    const nextToastCount = toastCount + 1;
    setLastSavedNotice(savedNotice);
    setToastCount(nextToastCount);
    setToast({ key: `saved-workout-${nextToastCount}`, message: `Saved ${savedNotice.workoutName}` });
  }

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <Box flex={1} background="background" style={{ paddingBottom: coachButtonClearance }}>
        <CreateHub
          workouts={workouts}
          toast={toast}
          onNewWorkout={() => router.push('/workouts/new')}
          onOpenExerciseLibrary={() => router.push('/exercises')}
          onEditWorkout={editWorkout}
          onDuplicateWorkout={duplicateWorkout}
          onDeleteWorkout={confirmDeleteWorkout}
          onToastDismissed={dismissToast}
        />
      </Box>
    </SafeAreaView>
  );
}
