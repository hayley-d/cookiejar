import { describe, expect, test } from 'bun:test';

import { healthDayRange } from '@/health/healthDayRange';

describe('healthDayRange', () => {
  test('today runs from local midnight to now', () => {
    const now = new Date(2026, 9, 5, 9, 41, 12);
    const range = healthDayRange('2026-10-05', now);
    expect(range.startDate.getTime()).toBe(new Date(2026, 9, 5, 0, 0).getTime());
    expect(range.endDate.getTime()).toBe(now.getTime());
  });

  test('a past date runs from its local midnight to the following midnight', () => {
    const now = new Date(2026, 9, 5, 9, 41);
    const range = healthDayRange('2026-10-03', now);
    expect(range.startDate.getTime()).toBe(new Date(2026, 9, 3, 0, 0).getTime());
    expect(range.endDate.getTime()).toBe(new Date(2026, 9, 4, 0, 0).getTime());
  });

  test('a past date at the end of a month ends at the first of the next month', () => {
    const range = healthDayRange('2026-09-30', new Date(2026, 9, 5, 9, 41));
    expect(range.endDate.getTime()).toBe(new Date(2026, 9, 1, 0, 0).getTime());
  });
});
