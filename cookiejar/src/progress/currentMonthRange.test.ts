import { describe, expect, test } from 'bun:test';

import { currentMonthRange, lifetimeRange } from '@/progress/currentMonthRange';

describe('currentMonthRange', () => {
  test('spans the first to the last day of the month containing today', () => {
    expect(currentMonthRange(new Date(2026, 9, 5))).toEqual({ startDate: '2026-10-01', endDate: '2026-10-31' });
  });

  test('handles a 30-day month and a leap February', () => {
    expect(currentMonthRange(new Date(2026, 8, 30))).toEqual({ startDate: '2026-09-01', endDate: '2026-09-30' });
    expect(currentMonthRange(new Date(2028, 1, 10))).toEqual({ startDate: '2028-02-01', endDate: '2028-02-29' });
  });

  test('handles December', () => {
    expect(currentMonthRange(new Date(2026, 11, 31))).toEqual({ startDate: '2026-12-01', endDate: '2026-12-31' });
  });
});

describe('lifetimeRange', () => {
  test('has no start date and ends today', () => {
    expect(lifetimeRange(new Date(2026, 9, 5))).toEqual({ startDate: null, endDate: '2026-10-05' });
  });
});
