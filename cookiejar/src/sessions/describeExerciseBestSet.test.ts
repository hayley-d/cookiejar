import { describe, expect, test } from 'bun:test';

import { describeExerciseBestSet } from '@/sessions/describeExerciseBestSet';

function setOf(values: Partial<Parameters<typeof describeExerciseBestSet>[1][number]>) {
  return {
    repetitions: null,
    weightKilograms: null,
    durationSeconds: null,
    distanceMeters: null,
    completedAt: '2026-10-07T10:00:00Z',
    ...values,
  };
}

describe('describeExerciseBestSet', () => {
  test('weighted: heaviest weight, then most reps', () => {
    expect(
      describeExerciseBestSet('repetitions_and_weight', [
        setOf({ weightKilograms: 60, repetitions: 10 }),
        setOf({ weightKilograms: 62.5, repetitions: 6 }),
        setOf({ weightKilograms: 62.5, repetitions: 8 }),
      ]),
    ).toBe('62.5 × 8');
  });

  test('ignores unticked sets', () => {
    expect(
      describeExerciseBestSet('repetitions', [setOf({ repetitions: 30, completedAt: null }), setOf({ repetitions: 12 })]),
    ).toBe('12');
  });

  test('duration and distance', () => {
    expect(describeExerciseBestSet('duration', [setOf({ durationSeconds: 30 }), setOf({ durationSeconds: 90 })])).toBe(
      '1m 30s',
    );
    expect(describeExerciseBestSet('distance', [setOf({ distanceMeters: 800 })])).toBe('800 m');
  });

  test('is null without completed sets', () => {
    expect(describeExerciseBestSet('repetitions', [])).toBeNull();
  });
});
