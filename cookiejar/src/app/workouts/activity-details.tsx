import { Stack } from 'expo-router';
import { useState } from 'react';

import { TextButton } from '@/components/atoms/TextButton';
import { ActivityDetailsForm, type ActivityDetailsErrors } from '@/components/organisms/ActivityDetailsForm';
import { useSaveWorkout } from '@/hooks/useSaveWorkout';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';
import { imageUrlError } from '@/images/imageUrls';
import { defaultActivityDetails } from '@/workouts/workoutEditorReducer';
import { workoutNameError } from '@/workouts/workoutNameError';

export default function ActivityDetailsScreen() {
  const { state, dispatch } = useWorkoutEditor();
  const { isSaving, save: saveEditorState } = useSaveWorkout();
  useUnsavedChangesGuard(state.hasUnsavedChanges);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const activityDetails = state.activityDetails ?? defaultActivityDetails;
  const imageUrlProblem = imageUrlError(activityDetails.imageUrl);
  const isEditingSavedWorkout = state.workoutId !== null;
  const nameError = workoutNameError(state.name);
  const errors: ActivityDetailsErrors =
    hasAttemptedSave && imageUrlProblem !== null ? { imageUrl: imageUrlProblem } : {};

  const save = async () => {
    setHasAttemptedSave(true);
    if (imageUrlProblem !== null || nameError !== null) {
      return;
    }
    await saveEditorState(state);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TextButton label="Save" onPress={save} disabled={isSaving || nameError !== null} />
          ),
        }}
      />
      <ActivityDetailsForm
        workoutName={
          isEditingSavedWorkout
            ? {
                name: state.name,
                error: nameError,
                onChangeName: (name) => dispatch({ type: 'renamed', name }),
              }
            : undefined
        }
        activityDetails={activityDetails}
        errors={errors}
        onChangeActivityDetails={(changes) => dispatch({ type: 'activityDetailsChanged', changes })}
      />
    </>
  );
}
