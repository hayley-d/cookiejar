import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import { saveWorkout } from '@/database/repositories/workoutRepository';
import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';
import { announceWorkoutSaved } from '@/stores/workoutSavedStore';
import type { WorkoutEditorState } from '@/workouts/workoutEditorReducer';

export function useSaveWorkout() {
  const database = useSQLiteContext();
  const { leaveWithoutPrompt } = useWorkoutEditor();
  const [isSaving, setIsSaving] = useState(false);
  const isSaveInFlight = useRef(false);

  const save = async (editorState: WorkoutEditorState) => {
    if (isSaveInFlight.current) {
      return;
    }
    isSaveInFlight.current = true;
    setIsSaving(true);
    try {
      await saveWorkout(database, editorState);
      announceWorkoutSaved(editorState.name.trim());
      leaveWithoutPrompt(() => router.dismissTo('/create'));
    } catch {
      Alert.alert('Could not save the workout', 'Something went wrong. Please try again.');
    } finally {
      isSaveInFlight.current = false;
      setIsSaving(false);
    }
  };

  return { isSaving, save };
}
