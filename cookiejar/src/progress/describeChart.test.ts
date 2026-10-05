import { describe, expect, test } from 'bun:test';

import { describeChartPoint, describeChartSummary } from '@/progress/describeChart';

describe('describeChart', () => {
  test('describes a point with its date and value', () => {
    expect(describeChartPoint({ date: '2026-10-05', value: 72.4 }, 'kg')).toBe('Mon 5 Oct · 72.4 kg');
  });

  test('summarises the series and its axis', () => {
    const points = [
      { date: '2026-10-01', value: 70 },
      { date: '2026-10-05', value: 72 },
    ];
    expect(describeChartSummary(points, 'kg', { minimum: 0, maximum: 80 })).toBe(
      '2 values in kg from Thu 1 Oct to Mon 5 Oct, between 0 and 80',
    );
    expect(describeChartSummary([], 'kg', { minimum: 0, maximum: 1 })).toBe('No values in kg');
  });
});
