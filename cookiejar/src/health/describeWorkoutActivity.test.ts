import { describe, expect, test } from 'bun:test';

import { describeWorkoutActivity } from '@/health/describeWorkoutActivity';

describe('describeWorkoutActivity', () => {
  test('names common activity types', () => {
    expect(describeWorkoutActivity(50)).toBe('Strength Training');
    expect(describeWorkoutActivity(37)).toBe('Running');
    expect(describeWorkoutActivity(57)).toBe('Yoga');
  });

  test('falls back to Workout for unknown codes', () => {
    expect(describeWorkoutActivity(9999)).toBe('Workout');
  });
});
