import { describe, expect, test } from 'bun:test';

import { findNearestPointIndex } from '@/progress/findNearestPointIndex';

describe('findNearestPointIndex', () => {
  test('finds the position closest to the target', () => {
    expect(findNearestPointIndex([10, 50, 120], 70)).toBe(1);
    expect(findNearestPointIndex([10, 50, 120], 100)).toBe(2);
    expect(findNearestPointIndex([10, 50, 120], -20)).toBe(0);
  });

  test('prefers the earlier point on a tie', () => {
    expect(findNearestPointIndex([10, 30], 20)).toBe(0);
  });

  test('is null when there are no positions', () => {
    expect(findNearestPointIndex([], 20)).toBeNull();
  });
});
