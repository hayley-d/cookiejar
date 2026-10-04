import { describe, expect, test } from 'bun:test';

import { addDays } from '@/dates/addDays';
import { dayOfWeekNumber } from '@/dates/dayOfWeekNumber';
import { isSameLocalDay } from '@/dates/isSameLocalDay';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { startOfWeek } from '@/dates/startOfWeek';
import { toLocalDateString } from '@/dates/toLocalDateString';

describe('toLocalDateString', () => {
  test('pads month and day', () => {
    expect(toLocalDateString(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  test('uses the local day late in the evening', () => {
    expect(toLocalDateString(new Date(2026, 11, 31, 23, 30))).toBe('2026-12-31');
  });
});

describe('parseLocalDateString', () => {
  test('returns local midnight', () => {
    const date = parseLocalDateString('2026-10-04');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(9);
    expect(date.getDate()).toBe(4);
    expect(date.getHours()).toBe(0);
  });

  test('round-trips with toLocalDateString', () => {
    expect(toLocalDateString(parseLocalDateString('2024-02-29'))).toBe('2024-02-29');
  });

  test('rejects malformed text', () => {
    expect(() => parseLocalDateString('2026-1-4')).toThrow();
    expect(() => parseLocalDateString('not a date')).toThrow();
  });

  test('rejects impossible dates', () => {
    expect(() => parseLocalDateString('2026-02-30')).toThrow();
    expect(() => parseLocalDateString('2026-13-01')).toThrow();
  });
});

describe('dayOfWeekNumber', () => {
  test('Monday is 1', () => {
    expect(dayOfWeekNumber(new Date(2026, 9, 5))).toBe(1);
  });

  test('Sunday is 7', () => {
    expect(dayOfWeekNumber(new Date(2026, 9, 4))).toBe(7);
  });
});

describe('startOfWeek', () => {
  test('a Sunday belongs to the week that started the previous Monday', () => {
    expect(toLocalDateString(startOfWeek(new Date(2026, 9, 4, 18, 0)))).toBe('2026-09-28');
  });

  test('a Monday is its own week start at midnight', () => {
    const weekStart = startOfWeek(new Date(2026, 9, 5, 9, 15));
    expect(toLocalDateString(weekStart)).toBe('2026-10-05');
    expect(weekStart.getHours()).toBe(0);
    expect(weekStart.getMinutes()).toBe(0);
  });

  test('rolls back across a month boundary', () => {
    expect(toLocalDateString(startOfWeek(new Date(2026, 6, 2)))).toBe('2026-06-29');
  });

  test('rolls back across a year boundary', () => {
    expect(toLocalDateString(startOfWeek(new Date(2027, 0, 1)))).toBe('2026-12-28');
  });
});

describe('addDays', () => {
  test('rolls over the end of a month', () => {
    expect(toLocalDateString(addDays(new Date(2026, 0, 31), 1))).toBe('2026-02-01');
  });

  test('rolls over the end of a year', () => {
    expect(toLocalDateString(addDays(new Date(2026, 11, 30), 3))).toBe('2027-01-02');
  });

  test('goes backwards with a negative count', () => {
    expect(toLocalDateString(addDays(new Date(2026, 2, 1), -1))).toBe('2026-02-28');
  });

  test('keeps the time of day', () => {
    const result = addDays(new Date(2026, 9, 4, 7, 45), 2);
    expect(result.getHours()).toBe(7);
    expect(result.getMinutes()).toBe(45);
  });
});

describe('isSameLocalDay', () => {
  test('true for different times on the same day', () => {
    expect(isSameLocalDay(new Date(2026, 9, 4, 0, 0), new Date(2026, 9, 4, 23, 59))).toBe(true);
  });

  test('false across midnight', () => {
    expect(isSameLocalDay(new Date(2026, 9, 4, 23, 59), new Date(2026, 9, 5, 0, 0))).toBe(false);
  });

  test('false for the same day in a different month', () => {
    expect(isSameLocalDay(new Date(2026, 8, 4), new Date(2026, 9, 4))).toBe(false);
  });
});
