import { describe, expect, test } from 'bun:test';

import {
  imageUrlToStore,
  isPreviewableImageUrl,
  validateExerciseForm,
  type ExerciseFormValues,
} from '@/exercises/validateExerciseForm';

const validValues: ExerciseFormValues = {
  name: 'Squat',
  bodyPart: 'quadriceps',
  defaultTrackingType: 'repetitions_and_weight',
  imageUrl: '',
};

const existingExercises = [
  { id: 1, name: 'Bench Press' },
  { id: 2, name: 'Deadlift' },
];

describe('validateExerciseForm', () => {
  test('valid values have no errors', () => {
    expect(validateExerciseForm(validValues, { existingExercises })).toEqual({});
  });

  test('name is required', () => {
    const errors = validateExerciseForm({ ...validValues, name: '' }, { existingExercises });
    expect(errors.name).toBe('Give your exercise a name');
  });

  test('a name of only spaces is treated as empty', () => {
    const errors = validateExerciseForm({ ...validValues, name: '   ' }, { existingExercises });
    expect(errors.name).toBe('Give your exercise a name');
  });

  test('a duplicate name in a different case is rejected', () => {
    const errors = validateExerciseForm({ ...validValues, name: 'bench press' }, { existingExercises });
    expect(errors.name).toBe('You already have an exercise called "Bench Press"');
  });

  test('a duplicate name is compared after trimming', () => {
    const errors = validateExerciseForm({ ...validValues, name: '  Deadlift  ' }, { existingExercises });
    expect(errors.name).toBe('You already have an exercise called "Deadlift"');
  });

  test('editing an exercise may keep its own name', () => {
    const errors = validateExerciseForm(
      { ...validValues, name: 'BENCH PRESS' },
      { existingExercises, editingExerciseId: 1 },
    );
    expect(errors.name).toBeUndefined();
  });

  test('editing an exercise may not take another exercise name', () => {
    const errors = validateExerciseForm(
      { ...validValues, name: 'deadlift' },
      { existingExercises, editingExerciseId: 1 },
    );
    expect(errors.name).toBe('You already have an exercise called "Deadlift"');
  });

  test('body part is required', () => {
    const errors = validateExerciseForm({ ...validValues, bodyPart: null }, { existingExercises });
    expect(errors.bodyPart).toBe('Choose a body part');
  });

  test('tracking type is required', () => {
    const errors = validateExerciseForm({ ...validValues, defaultTrackingType: null }, { existingExercises });
    expect(errors.defaultTrackingType).toBe('Choose how this exercise is measured');
  });

  test('every missing field reports its own error', () => {
    const errors = validateExerciseForm(
      { name: '', bodyPart: null, defaultTrackingType: null, imageUrl: 'http://example.com' },
      { existingExercises },
    );
    expect(Object.keys(errors).sort()).toEqual(['bodyPart', 'defaultTrackingType', 'imageUrl', 'name']);
  });

  test('an empty image URL is valid', () => {
    const errors = validateExerciseForm({ ...validValues, imageUrl: '' }, { existingExercises });
    expect(errors.imageUrl).toBeUndefined();
  });

  test('an image URL of only spaces is valid', () => {
    const errors = validateExerciseForm({ ...validValues, imageUrl: '   ' }, { existingExercises });
    expect(errors.imageUrl).toBeUndefined();
  });

  test('an https image URL is valid', () => {
    const errors = validateExerciseForm(
      { ...validValues, imageUrl: '  https://example.com/squat.jpg  ' },
      { existingExercises },
    );
    expect(errors.imageUrl).toBeUndefined();
  });

  test('the https prefix is case-insensitive', () => {
    const errors = validateExerciseForm(
      { ...validValues, imageUrl: 'HTTPS://example.com/squat.jpg' },
      { existingExercises },
    );
    expect(errors.imageUrl).toBeUndefined();
  });

  test('an http image URL is rejected', () => {
    const errors = validateExerciseForm(
      { ...validValues, imageUrl: 'http://example.com/squat.jpg' },
      { existingExercises },
    );
    expect(errors.imageUrl).toBe('Image URL must start with https://');
  });

  test('an image URL without a scheme is rejected', () => {
    const errors = validateExerciseForm({ ...validValues, imageUrl: 'example.com/squat.jpg' }, { existingExercises });
    expect(errors.imageUrl).toBe('Image URL must start with https://');
  });

  test('an image URL of only the https prefix is rejected', () => {
    const errors = validateExerciseForm({ ...validValues, imageUrl: 'https://' }, { existingExercises });
    expect(errors.imageUrl).toBe('Image URL must start with https://');
  });
});

describe('isPreviewableImageUrl', () => {
  test('a valid https URL can be previewed', () => {
    expect(isPreviewableImageUrl(' https://example.com/squat.jpg ')).toBe(true);
  });

  test('an empty URL cannot be previewed', () => {
    expect(isPreviewableImageUrl('')).toBe(false);
  });

  test('an incomplete URL cannot be previewed', () => {
    expect(isPreviewableImageUrl('https://')).toBe(false);
  });
});

describe('imageUrlToStore', () => {
  test('an empty URL is stored as null', () => {
    expect(imageUrlToStore('  ')).toBeNull();
  });

  test('a URL is stored trimmed', () => {
    expect(imageUrlToStore('  https://example.com/squat.jpg ')).toBe('https://example.com/squat.jpg');
  });
});
