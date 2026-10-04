import type { BodyPart } from '@/types/BodyPart';
import type { Exercise } from '@/types/Exercise';
import type { TrackingType } from '@/types/TrackingType';

export type ExerciseFormValues = {
  name: string;
  bodyPart: BodyPart | null;
  defaultTrackingType: TrackingType | null;
  imageUrl: string;
};

export type ExerciseFormErrors = Partial<Record<keyof ExerciseFormValues, string>>;

type ExerciseFormValidationContext = {
  existingExercises: Pick<Exercise, 'id' | 'name'>[];
  editingExerciseId?: number;
};

const imageUrlPrefix = 'https://';

export function isPreviewableImageUrl(imageUrl: string) {
  const trimmedImageUrl = imageUrl.trim();
  return (
    trimmedImageUrl.length > imageUrlPrefix.length && trimmedImageUrl.toLowerCase().startsWith(imageUrlPrefix)
  );
}

export function imageUrlToStore(imageUrl: string) {
  const trimmedImageUrl = imageUrl.trim();
  return trimmedImageUrl.length === 0 ? null : trimmedImageUrl;
}

export function duplicateExerciseNameMessage(name: string) {
  return `You already have an exercise called "${name}"`;
}

export function validateExerciseForm(
  values: ExerciseFormValues,
  { existingExercises, editingExerciseId }: ExerciseFormValidationContext,
): ExerciseFormErrors {
  const errors: ExerciseFormErrors = {};
  const trimmedName = values.name.trim();

  if (trimmedName.length === 0) {
    errors.name = 'Give your exercise a name';
  } else {
    const duplicateExercise = existingExercises.find(
      (existingExercise) =>
        existingExercise.id !== editingExerciseId &&
        existingExercise.name.toLowerCase() === trimmedName.toLowerCase(),
    );
    if (duplicateExercise) {
      errors.name = duplicateExerciseNameMessage(duplicateExercise.name);
    }
  }

  if (values.bodyPart === null) {
    errors.bodyPart = 'Choose a body part';
  }

  if (values.defaultTrackingType === null) {
    errors.defaultTrackingType = 'Choose how this exercise is measured';
  }

  if (imageUrlToStore(values.imageUrl) !== null && !isPreviewableImageUrl(values.imageUrl)) {
    errors.imageUrl = 'Image URL must start with https://';
  }

  return errors;
}
