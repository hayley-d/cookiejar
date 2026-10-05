import { useState } from 'react';

import { DuplicateExerciseNameError, type NewExercise } from '@/database/repositories/exerciseRepository';
import {
  duplicateExerciseNameMessage,
  validateExerciseForm,
  type ExerciseFormErrors,
  type ExerciseFormValues,
} from '@/exercises/validateExerciseForm';
import { useExercises } from '@/hooks/useExercises';
import { imageUrlToStore } from '@/images/imageUrls';

type ExerciseFormOptions = {
  initialValues: ExerciseFormValues;
  editingExerciseId?: number;
  saveExercise: (exercise: NewExercise) => Promise<void>;
};

export function useExerciseForm({ initialValues, editingExerciseId, saveExercise }: ExerciseFormOptions) {
  const exercises = useExercises();
  const [values, setValues] = useState(initialValues);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const validationErrors = validateExerciseForm(values, {
    existingExercises: exercises ?? [],
    editingExerciseId,
  });
  const visibleErrors: ExerciseFormErrors = hasAttemptedSave ? validationErrors : {};
  const errors: ExerciseFormErrors = saveError ? { ...visibleErrors, name: saveError } : visibleErrors;

  function changeValues(changedValues: ExerciseFormValues) {
    setSaveError(null);
    setValues(changedValues);
  }

  async function save() {
    setHasAttemptedSave(true);
    if (Object.keys(validationErrors).length > 0 || !values.bodyPart || !values.defaultTrackingType) {
      return;
    }
    setIsSaving(true);
    try {
      await saveExercise({
        name: values.name.trim(),
        bodyPart: values.bodyPart,
        defaultTrackingType: values.defaultTrackingType,
        imageUrl: imageUrlToStore(values.imageUrl),
      });
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

  return { values, errors, isSaving, changeValues, save };
}
