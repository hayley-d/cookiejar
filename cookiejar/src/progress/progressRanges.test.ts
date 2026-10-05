import { describe, expect, test } from 'bun:test';

import { filterPointsToRange, progressRangeLabels, rangeStartDate } from '@/progress/progressRanges';

describe('rangeStartDate', () => {
  test('counts back whole days for 30 and 90 days', () => {
    expect(rangeStartDate('thirtyDays', '2026-10-05')).toBe('2026-09-05');
    expect(rangeStartDate('ninetyDays', '2026-10-05')).toBe('2026-07-07');
  });

  test('counts back calendar months for 3 and 6 months', () => {
    expect(rangeStartDate('threeMonths', '2026-10-05')).toBe('2026-07-05');
    expect(rangeStartDate('sixMonths', '2026-10-05')).toBe('2026-04-05');
    expect(rangeStartDate('sixMonths', '2026-02-10')).toBe('2025-08-10');
  });

  test('counts back one calendar year for 1 year', () => {
    expect(rangeStartDate('oneYear', '2026-10-05')).toBe('2025-10-05');
  });

  test('clamps to the last day of a shorter month', () => {
    expect(rangeStartDate('threeMonths', '2026-05-31')).toBe('2026-02-28');
    expect(rangeStartDate('sixMonths', '2026-08-31')).toBe('2026-02-28');
    expect(rangeStartDate('oneYear', '2028-02-29')).toBe('2027-02-28');
  });

  test('has no start date for all', () => {
    expect(rangeStartDate('all', '2026-10-05')).toBeNull();
  });
});

describe('filterPointsToRange', () => {
  const points = [
    { date: '2025-01-01', value: 70 },
    { date: '2026-09-04', value: 71 },
    { date: '2026-09-05', value: 72 },
    { date: '2026-10-05', value: 73 },
    { date: '2026-10-06', value: 74 },
  ];

  test('keeps points from the start date up to and including today', () => {
    expect(filterPointsToRange(points, 'thirtyDays', '2026-10-05')).toEqual([
      { date: '2026-09-05', value: 72 },
      { date: '2026-10-05', value: 73 },
    ]);
  });

  test('keeps every point up to today for all', () => {
    expect(filterPointsToRange(points, 'all', '2026-10-05')).toEqual(points.slice(0, 4));
  });

  test('returns nothing when no point falls in the window', () => {
    expect(filterPointsToRange([{ date: '2025-01-01', value: 70 }], 'ninetyDays', '2026-10-05')).toEqual([]);
  });
});

describe('progressRangeLabels', () => {
  test('labels every range', () => {
    expect(progressRangeLabels).toEqual({
      thirtyDays: '30 d',
      ninetyDays: '90 d',
      oneYear: '1 y',
      threeMonths: '3 m',
      sixMonths: '6 m',
      all: 'All',
    });
  });
});
