import { describe, expect, test } from 'bun:test';

import { compareToAverage } from '@/health/compareToAverage';

describe('compareToAverage', () => {
  test('returns null when today is null', () => {
    expect(compareToAverage(null, [50, 52])).toBeNull();
  });

  test('returns null when there are no previous values', () => {
    expect(compareToAverage(54, [])).toBeNull();
    expect(compareToAverage(54, [null, null])).toBeNull();
  });

  test('ignores nulls in the average', () => {
    const comparison = compareToAverage(54, [50, null, 52]);
    expect(comparison?.average).toBe(51);
    expect(comparison?.difference).toBe(3);
  });

  test('rounds the difference to whole bpm', () => {
    expect(compareToAverage(54, [56, 55, 55])?.difference).toBe(-1);
    expect(compareToAverage(54, [50, 51])?.difference).toBe(4);
  });

  test('direction follows the rounded difference', () => {
    expect(compareToAverage(54, [56])?.direction).toBe('down');
    expect(compareToAverage(54, [52])?.direction).toBe('up');
    expect(compareToAverage(54, [54])?.direction).toBe('level');
    expect(compareToAverage(54, [54.3])?.direction).toBe('level');
  });

  test('down or level is positive', () => {
    expect(compareToAverage(50, [60])?.tone).toBe('positive');
    expect(compareToAverage(54, [54])?.tone).toBe('positive');
  });

  test('up by 4 is default and up by 5 is attention', () => {
    expect(compareToAverage(54, [50])?.tone).toBe('default');
    expect(compareToAverage(55, [50])?.tone).toBe('attention');
    expect(compareToAverage(70, [50])?.tone).toBe('attention');
  });

  test('up by 1 is default', () => {
    expect(compareToAverage(51, [50])?.tone).toBe('default');
  });
});
