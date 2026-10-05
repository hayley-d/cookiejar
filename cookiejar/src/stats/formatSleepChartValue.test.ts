import { describe, expect, test } from 'bun:test';

import { formatSleepChartValue } from '@/stats/formatSleepChartValue';

describe('formatSleepChartValue', () => {
  test('formats minutes as hours and minutes, dropping empty parts', () => {
    expect(formatSleepChartValue(435)).toBe('7h 15m');
    expect(formatSleepChartValue(480)).toBe('8h');
    expect(formatSleepChartValue(45)).toBe('45m');
    expect(formatSleepChartValue(0)).toBe('0s');
  });

  test('rounds fractional minutes', () => {
    expect(formatSleepChartValue(419.6)).toBe('7h');
  });
});
