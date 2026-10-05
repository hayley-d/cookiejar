import { describe, expect, test } from 'bun:test';

import { barFraction, largestValue } from '@/stats/barFraction';

describe('barFraction', () => {
  test('returns the value as a fraction of the maximum', () => {
    expect(barFraction(5000, 10000)).toBe(0.5);
    expect(barFraction(10000, 10000)).toBe(1);
  });

  test('returns 0 for a null value', () => {
    expect(barFraction(null, 10000)).toBe(0);
  });

  test('returns 0 when the maximum is 0 or less', () => {
    expect(barFraction(0, 0)).toBe(0);
    expect(barFraction(5, 0)).toBe(0);
  });

  test('clamps to between 0 and 1', () => {
    expect(barFraction(15, 10)).toBe(1);
    expect(barFraction(-5, 10)).toBe(0);
  });
});

describe('largestValue', () => {
  test('ignores nulls and returns 0 when there are no values', () => {
    expect(largestValue([null, 3, 9, null])).toBe(9);
    expect(largestValue([null, null])).toBe(0);
    expect(largestValue([])).toBe(0);
  });
});
