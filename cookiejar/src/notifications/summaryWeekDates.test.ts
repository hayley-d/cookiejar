import { describe, expect, test } from 'bun:test';

import { summaryWeekDates } from '@/notifications/summaryWeekDates';

describe('summaryWeekDates', () => {
  test('returns the seven days of the week that contains a Sunday', () => {
    expect(summaryWeekDates(new Date(2026, 9, 11, 19, 0))).toEqual([
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
    ]);
  });

  test('returns the week that contains a mid-week day', () => {
    const weekDates = summaryWeekDates(new Date(2026, 9, 7, 12, 0));
    expect(weekDates[0]).toBe('2026-10-05');
    expect(weekDates[6]).toBe('2026-10-11');
  });
});
