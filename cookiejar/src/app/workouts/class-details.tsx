import { Stack } from 'expo-router';
import { useState } from 'react';

import { TextButton } from '@/components/atoms/TextButton';
import { ClassDetailsForm, type ClassDetailsErrors } from '@/components/organisms/ClassDetailsForm';
import { useSaveWorkout } from '@/hooks/useSaveWorkout';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';
import { imageUrlError } from '@/images/imageUrls';
import { defaultClassDetails } from '@/workouts/workoutEditorReducer';
import { workoutNameError } from '@/workouts/workoutNameError';

export default function ClassDetailsScreen() {
  const { state, dispatch } = useWorkoutEditor();
  const { isSaving, save: saveEditorState } = useSaveWorkout();
  useUnsavedChangesGuard(state.hasUnsavedChanges);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const classDetails = state.classDetails ?? defaultClassDetails;
  const imageUrlProblem = imageUrlError(classDetails.imageUrl);
  const errors: ClassDetailsErrors = hasAttemptedSave && imageUrlProblem !== null ? { imageUrl: imageUrlProblem } : {};

  const save = async () => {
    setHasAttemptedSave(true);
    if (imageUrlProblem !== null || workoutNameError(state.name) !== null) {
      return;
    }
    await saveEditorState(state);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <TextButton label="Save" onPress={save} disabled={isSaving} />,
        }}
      />
      <ClassDetailsForm
        classDetails={classDetails}
        errors={errors}
        onChangeClassDetails={(changes) => dispatch({ type: 'classDetailsChanged', changes })}
      />
    </>
  );
}
