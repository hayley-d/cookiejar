import { describe, expect, test } from 'bun:test';

import { estimateMinutesForWorkoutWithItems, estimateWorkoutMinutes } from '@/workouts/estimateWorkoutMinutes';
import type { WorkoutWithItems } from '@/types/WorkoutWithItems';

function makeWorkoutWithItems(items: { restSeconds: number | null; targetSetCount: number }[]): WorkoutWithItems {
  return {
    items: items.map((item, index) => ({
      id: index + 1,
      restSeconds: item.restSeconds,
      targetSets: Array.from({ length: item.targetSetCount }, (unused, setIndex) => ({ id: setIndex + 1 })),
    })),
  } as unknown as WorkoutWithItems;
}

describe('estimateWorkoutMinutes', () => {
  test('is zero without target sets', () => {
    expect(estimateWorkoutMinutes({ targetSetCount: 0, targetRestSeconds: 0 })).toBe(0);
  });

  test('adds 90 seconds per set to the total rest', () => {
    expect(estimateWorkoutMinutes({ targetSetCount: 10, targetRestSeconds: 900 })).toBe(30);
  });

  test('rounds to the nearest five minutes', () => {
    expect(estimateWorkoutMinutes({ targetSetCount: 8, targetRestSeconds: 720 })).toBe(25);
    expect(estimateWorkoutMinutes({ targetSetCount: 9, targetRestSeconds: 810 })).toBe(25);
    expect(estimateWorkoutMinutes({ targetSetCount: 1, targetRestSeconds: 60 })).toBe(5);
    expect(estimateWorkoutMinutes({ targetSetCount: 1, targetRestSeconds: 0 })).toBe(0);
  });
});

describe('estimateMinutesForWorkoutWithItems', () => {
  test('uses the item rest seconds for each target set', () => {
    const workout = makeWorkoutWithItems([{ restSeconds: 60, targetSetCount: 10 }]);
    expect(estimateMinutesForWorkoutWithItems(workout)).toBe(25);
  });

  test('uses 90 seconds of rest when the item has none', () => {
    const workout = makeWorkoutWithItems([{ restSeconds: null, targetSetCount: 10 }]);
    expect(estimateMinutesForWorkoutWithItems(workout)).toBe(30);
  });

  test('sums across items', () => {
    const workout = makeWorkoutWithItems([
      { restSeconds: 60, targetSetCount: 4 },
      { restSeconds: null, targetSetCount: 6 },
    ]);
    expect(estimateMinutesForWorkoutWithItems(workout)).toBe(30);
  });
});
