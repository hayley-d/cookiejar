import { router, Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';

import { ExerciseForm } from '@/components/organisms/ExerciseForm';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { createExercise, DuplicateExerciseNameError } from '@/database/repositories/exerciseRepository';
import {
  duplicateExerciseNameMessage,
  validateExerciseForm,
  type ExerciseFormErrors,
  type ExerciseFormValues,
} from '@/exercises/validateExerciseForm';
import { useExercises } from '@/hooks/useExercises';

const initialValues: ExerciseFormValues = {
  name: '',
  bodyPart: null,
  defaultTrackingType: 'repetitions_and_weight',
};

export default function NewExerciseScreen() {
  const database = useSQLiteContext();
  const exercises = useExercises();
  const [values, setValues] = useState(initialValues);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const validationErrors = validateExerciseForm(values, { existingExercises: exercises ?? [] });
  const visibleErrors: ExerciseFormErrors = hasAttemptedSave ? validationErrors : {};
  const errors: ExerciseFormErrors = saveError ? { ...visibleErrors, name: saveError } : visibleErrors;

  function handleChangeValues(changedValues: ExerciseFormValues) {
    setSaveError(null);
    setValues(changedValues);
  }

  async function handleSave() {
    setHasAttemptedSave(true);
    if (Object.keys(validationErrors).length > 0 || !values.bodyPart || !values.defaultTrackingType) {
      return;
    }
    setIsSaving(true);
    try {
      await createExercise(database, {
        name: values.name.trim(),
        bodyPart: values.bodyPart,
        defaultTrackingType: values.defaultTrackingType,
        imageUrl: null,
      });
      router.back();
    } catch (error) {
      if (error instanceof DuplicateExerciseNameError) {
        setSaveError(duplicateExerciseNameMessage(error.exerciseName));
      } else {
        throw error;
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Touchable onPress={handleSave} disabled={isSaving} accessibilityLabel="Save">
              <Typography variant="label" color="accent">
                Save
              </Typography>
            </Touchable>
          ),
        }}
      />
      <ExerciseForm values={values} errors={errors} onChangeValues={handleChangeValues} />
    </>
  );
}
