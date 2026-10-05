import { describe, expect, test } from 'bun:test';

import { datesBetween } from '@/dates/datesBetween';

describe('datesBetween', () => {
  test('lists every date inclusively', () => {
    expect(datesBetween('2026-10-01', '2026-10-03')).toEqual(['2026-10-01', '2026-10-02', '2026-10-03']);
  });

  test('returns one date when start equals end', () => {
    expect(datesBetween('2026-10-05', '2026-10-05')).toEqual(['2026-10-05']);
  });

  test('crosses month boundaries', () => {
    expect(datesBetween('2026-09-30', '2026-10-01')).toEqual(['2026-09-30', '2026-10-01']);
  });

  test('returns nothing when start is after end', () => {
    expect(datesBetween('2026-10-05', '2026-10-04')).toEqual([]);
  });
});
