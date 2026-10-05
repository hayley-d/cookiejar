import { describe, expect, test } from 'bun:test';

import { describeClassCount, describeLastClassDate } from '@/progress/formatClassStatistics';

describe('describeClassCount', () => {
  test('prefixes the count with a multiplication sign', () => {
    expect(describeClassCount(12)).toBe('× 12');
    expect(describeClassCount(1)).toBe('× 1');
  });
});

describe('describeLastClassDate', () => {
  test('shows the local date of the latest session', () => {
    const startedAt = new Date(2026, 9, 5, 18, 30).toISOString();
    expect(describeLastClassDate(startedAt)).toBe('Mon 5 Oct');
  });
});
