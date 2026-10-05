import { describe, expect, test } from 'bun:test';

import { fillSetForTick, type FillableSet } from '@/sessions/fillSetForTick';

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

describe('fillSetForTick', () => {
  test('an empty set copies its targets', () => {
    const result = fillSetForTick('repetitions_and_weight', {
      ...emptySet,
      targetRepetitions: 8,
      targetWeightKilograms: 60,
    });
    expect(result).toEqual({
      outcome: 'ticked',
      values: { repetitions: 8, weightKilograms: 60, durationSeconds: null, distanceMeters: null },
    });
  });

  test('typed values are kept and only empty fields take the target', () => {
    const result = fillSetForTick('repetitions_and_weight', {
      ...emptySet,
      weightKilograms: 62.5,
      targetRepetitions: 8,
      targetWeightKilograms: 60,
    });
    expect(result).toEqual({
      outcome: 'ticked',
      values: { repetitions: 8, weightKilograms: 62.5, durationSeconds: null, distanceMeters: null },
    });
  });

  test('a set with values and no targets ticks as it is', () => {
    expect(fillSetForTick('repetitions', { ...emptySet, repetitions: 12 })).toEqual({
      outcome: 'ticked',
      values: { repetitions: 12, weightKilograms: null, durationSeconds: null, distanceMeters: null },
    });
  });

  test('a set with no values and no targets is refused', () => {
    expect(fillSetForTick('repetitions_and_weight', emptySet)).toEqual({ outcome: 'refused' });
  });

  test('targets for fields the tracking type does not use do not count', () => {
    expect(fillSetForTick('duration', { ...emptySet, targetRepetitions: 10 })).toEqual({ outcome: 'refused' });
  });

  test('a duration set copies its target time', () => {
    expect(fillSetForTick('duration', { ...emptySet, targetDurationSeconds: 60 })).toEqual({
      outcome: 'ticked',
      values: { repetitions: null, weightKilograms: null, durationSeconds: 60, distanceMeters: null },
    });
  });

  test('a distance set copies its target distance', () => {
    expect(fillSetForTick('distance', { ...emptySet, targetDistanceMeters: 5000 })).toEqual({
      outcome: 'ticked',
      values: { repetitions: null, weightKilograms: null, durationSeconds: null, distanceMeters: 5000 },
    });
  });
});
