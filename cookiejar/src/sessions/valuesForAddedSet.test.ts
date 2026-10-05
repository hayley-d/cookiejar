import { describe, expect, test } from 'bun:test';

import type { FillableSet } from '@/sessions/fillSetForTick';
import { valuesForAddedSet } from '@/sessions/valuesForAddedSet';

const emptySet: FillableSet = {
  repetitions: null,
  weightKilograms: null,
  durationSeconds: null,
  distanceMeters: null,
  targetRepetitions: null,
  targetWeightKilograms: null,
  targetDurationSeconds: null,
  targetDistanceMeters: null,
};

describe('valuesForAddedSet', () => {
  test('copies the last set actual values', () => {
    const lastSet = { ...emptySet, repetitions: 7, weightKilograms: 62.5, targetRepetitions: 8, targetWeightKilograms: 60 };
    expect(valuesForAddedSet(lastSet)).toEqual({
      repetitions: 7,
      weightKilograms: 62.5,
      durationSeconds: null,
      distanceMeters: null,
    });
  });

  test('copies the last set targets when it has no actual values', () => {
    const lastSet = { ...emptySet, targetRepetitions: 8, targetWeightKilograms: 60 };
    expect(valuesForAddedSet(lastSet)).toEqual({
      repetitions: 8,
      weightKilograms: 60,
      durationSeconds: null,
      distanceMeters: null,
    });
  });

  test('is empty without a last set', () => {
    expect(valuesForAddedSet(null)).toEqual({
      repetitions: null,
      weightKilograms: null,
      durationSeconds: null,
      distanceMeters: null,
    });
  });
});
