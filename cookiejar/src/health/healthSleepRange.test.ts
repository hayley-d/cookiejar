import { describe, expect, test } from 'bun:test';

import { healthSleepRange } from '@/health/healthSleepRange';

describe('healthSleepRange', () => {
  test('runs from 18:00 the previous day to 12:00 on the date', () => {
    const range = healthSleepRange('2026-10-05');
    expect(range.startDate.getTime()).toBe(new Date(2026, 9, 4, 18, 0).getTime());
    expect(range.endDate.getTime()).toBe(new Date(2026, 9, 5, 12, 0).getTime());
  });

  test('the previous day crosses a month boundary', () => {
    const range = healthSleepRange('2026-11-01');
    expect(range.startDate.getTime()).toBe(new Date(2026, 9, 31, 18, 0).getTime());
  });

  test('the previous day crosses a year boundary', () => {
    const range = healthSleepRange('2027-01-01');
    expect(range.startDate.getTime()).toBe(new Date(2026, 11, 31, 18, 0).getTime());
  });
});
