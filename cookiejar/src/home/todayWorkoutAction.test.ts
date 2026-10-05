import { describe, expect, test } from 'bun:test';

import { todayWorkoutActionLabel } from '@/home/todayWorkoutAction';

describe('todayWorkoutActionLabel', () => {
  test('labels each status', () => {
    expect(todayWorkoutActionLabel('planned')).toBe('▶ Start');
    expect(todayWorkoutActionLabel('inProgress')).toBe('Resume');
    expect(todayWorkoutActionLabel('completed')).toBe('✓ Done');
  });
});
