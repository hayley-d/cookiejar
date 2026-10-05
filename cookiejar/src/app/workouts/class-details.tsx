import { router, Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';

import { TextButton } from '@/components/atoms/TextButton';
import { ClassDetailsForm, type ClassDetailsErrors } from '@/components/organisms/ClassDetailsForm';
import { saveWorkout } from '@/database/repositories/workoutRepository';
import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';
import { imageUrlError } from '@/images/imageUrls';
import { announceWorkoutSaved } from '@/stores/workoutSavedStore';
import { defaultClassDetails } from '@/workouts/workoutEditorReducer';
import { workoutNameError } from '@/workouts/workoutNameError';

export default function ClassDetailsScreen() {
  const database = useSQLiteContext();
  const { state, dispatch } = useWorkoutEditor();
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const classDetails = state.classDetails ?? defaultClassDetails;
  const imageUrlProblem = imageUrlError(classDetails.imageUrl);
  const errors: ClassDetailsErrors = hasAttemptedSave && imageUrlProblem !== null ? { imageUrl: imageUrlProblem } : {};

  const save = async () => {
    setHasAttemptedSave(true);
    if (imageUrlProblem !== null || workoutNameError(state.name) !== null) {
      return;
    }
    setIsSaving(true);
    try {
      await saveWorkout(database, state);
      announceWorkoutSaved(state.name.trim());
      router.dismissTo('/create');
    } finally {
      setIsSaving(false);
    }
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
