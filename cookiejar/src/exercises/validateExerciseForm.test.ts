import { describe, expect, test } from 'bun:test';

import { validateExerciseForm, type ExerciseFormValues } from '@/exercises/validateExerciseForm';

const validValues: ExerciseFormValues = {
  name: 'Squat',
  bodyPart: 'quadriceps',
  defaultTrackingType: 'repetitions_and_weight',
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
      { name: '', bodyPart: null, defaultTrackingType: null },
      { existingExercises },
    );
    expect(Object.keys(errors).sort()).toEqual(['bodyPart', 'defaultTrackingType', 'name']);
  });
});
