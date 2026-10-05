import { describe, expect, test } from 'bun:test';

import { actualValuesAfterReplace, resolveReplacedExerciseId } from '@/sessions/replaceExercise';

const filledValues = {
  repetitions: 8,
  weightKilograms: 60,
  durationSeconds: 30,
  distanceMeters: 500,
};

describe('actualValuesAfterReplace', () => {
  test('the same tracking type keeps every value', () => {
    const values = {
      repetitions: 8,
      weightKilograms: 60,
      durationSeconds: null,
      distanceMeters: null,
    };
    expect(actualValuesAfterReplace(values, 'repetitions_and_weight')).toEqual(values);
  });

  test('weight is cleared when the new type only tracks repetitions', () => {
    expect(actualValuesAfterReplace(filledValues, 'repetitions')).toEqual({
      repetitions: 8,
      weightKilograms: null,
      durationSeconds: null,
      distanceMeters: null,
    });
  });

  test('every value is cleared that the new type does not use', () => {
    expect(actualValuesAfterReplace(filledValues, 'duration')).toEqual({
      repetitions: null,
      weightKilograms: null,
      durationSeconds: 30,
      distanceMeters: null,
    });
    expect(actualValuesAfterReplace(filledValues, 'distance')).toEqual({
      repetitions: null,
      weightKilograms: null,
      durationSeconds: null,
      distanceMeters: 500,
    });
  });
});

describe('resolveReplacedExerciseId', () => {
  test('the first replacement records the original exercise', () => {
    expect(
      resolveReplacedExerciseId({
        currentExerciseId: 1,
        currentReplacedExerciseId: null,
        newExerciseId: 2,
      }),
    ).toBe(1);
  });

  test('replacing again keeps the original, not the intermediate exercise', () => {
    expect(
      resolveReplacedExerciseId({
        currentExerciseId: 2,
        currentReplacedExerciseId: 1,
        newExerciseId: 3,
      }),
    ).toBe(1);
  });

  test('replacing back to the original clears the record', () => {
    expect(
      resolveReplacedExerciseId({
        currentExerciseId: 2,
        currentReplacedExerciseId: 1,
        newExerciseId: 1,
      }),
    ).toBeNull();
  });
});
