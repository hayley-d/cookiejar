import { describe, expect, test } from 'bun:test';

import {
  appendWeekPages,
  buildStartingWeekPages,
  isPageAligned,
  monthLabelForWeek,
  prependWeekPages,
  selectedDateAfterWeekChange,
  startingWeekPagesEachSide,
  weekPageDates,
  weekPageIndexContaining,
  weekPagesPerExtension,
} from '@/dates/weekPages';

describe('buildStartingWeekPages', () => {
  test('holds eight weeks either side of the centre week', () => {
    const weekStarts = buildStartingWeekPages(new Date(2026, 9, 7, 15, 30));
    expect(startingWeekPagesEachSide).toBe(8);
    expect(weekStarts).toHaveLength(17);
    expect(weekStarts[8]).toBe('2026-10-05');
  });

  test('every page is a Monday one week after the previous page', () => {
    const weekStarts = buildStartingWeekPages(new Date(2026, 9, 7));
    expect(weekStarts[0]).toBe('2026-08-10');
    expect(weekStarts[7]).toBe('2026-09-28');
    expect(weekStarts[9]).toBe('2026-10-12');
    expect(weekStarts[16]).toBe('2026-11-30');
  });

  test('a Sunday centres on the week that started the previous Monday', () => {
    expect(buildStartingWeekPages(new Date(2026, 9, 4))[8]).toBe('2026-09-28');
  });
});

describe('prependWeekPages', () => {
  test('adds the earlier weeks in order before the existing pages', () => {
    const weekStarts = ['2026-10-05', '2026-10-12'];
    expect(prependWeekPages(weekStarts, 2)).toEqual(['2026-09-21', '2026-09-28', '2026-10-05', '2026-10-12']);
  });

  test('adds eight weeks by default', () => {
    const weekStarts = buildStartingWeekPages(new Date(2026, 9, 5));
    const prependedWeekStarts = prependWeekPages(weekStarts);
    expect(weekPagesPerExtension).toBe(8);
    expect(prependedWeekStarts).toHaveLength(25);
    expect(prependedWeekStarts[0]).toBe('2026-06-15');
    expect(prependedWeekStarts.slice(8)).toEqual(weekStarts);
  });

  test('crosses a year boundary', () => {
    expect(prependWeekPages(['2027-01-04'], 1)).toEqual(['2026-12-28', '2027-01-04']);
  });

  test('does not change the given pages', () => {
    const weekStarts = ['2026-10-05'];
    prependWeekPages(weekStarts, 1);
    expect(weekStarts).toEqual(['2026-10-05']);
  });
});

describe('appendWeekPages', () => {
  test('adds the later weeks in order after the existing pages', () => {
    const weekStarts = ['2026-10-05', '2026-10-12'];
    expect(appendWeekPages(weekStarts, 2)).toEqual(['2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26']);
  });

  test('adds eight weeks by default', () => {
    const weekStarts = buildStartingWeekPages(new Date(2026, 9, 5));
    const appendedWeekStarts = appendWeekPages(weekStarts);
    expect(appendedWeekStarts).toHaveLength(25);
    expect(appendedWeekStarts.slice(0, 17)).toEqual(weekStarts);
    expect(appendedWeekStarts[24]).toBe('2027-01-25');
  });

  test('crosses a year boundary', () => {
    expect(appendWeekPages(['2026-12-28'], 1)).toEqual(['2026-12-28', '2027-01-04']);
  });
});

describe('weekPageIndexContaining', () => {
  const weekStarts = ['2026-09-28', '2026-10-05', '2026-10-12'];

  test('finds the week of a date in the middle of the week', () => {
    expect(weekPageIndexContaining(weekStarts, new Date(2026, 9, 8, 22, 0))).toBe(1);
  });

  test('a Sunday belongs to the week that started the previous Monday', () => {
    expect(weekPageIndexContaining(weekStarts, new Date(2026, 9, 18))).toBe(2);
  });

  test('accepts a local date string', () => {
    expect(weekPageIndexContaining(weekStarts, '2026-09-30')).toBe(0);
  });

  test('finds the current week after weeks are prepended', () => {
    const today = new Date(2026, 9, 7);
    const prependedWeekStarts = prependWeekPages(buildStartingWeekPages(today));
    expect(weekPageIndexContaining(prependedWeekStarts, today)).toBe(16);
  });

  test('is -1 when the week is not loaded', () => {
    expect(weekPageIndexContaining(weekStarts, '2026-10-19')).toBe(-1);
  });
});

describe('weekPageDates', () => {
  test('lists Monday to Sunday', () => {
    expect(weekPageDates('2026-09-28')).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ]);
  });
});

describe('monthLabelForWeek', () => {
  test('names the month and year', () => {
    expect(monthLabelForWeek('2026-10-12')).toBe('October 2026');
  });

  test('follows the Thursday when the week starts in the previous month', () => {
    expect(monthLabelForWeek('2026-09-28')).toBe('October 2026');
  });

  test('follows the Thursday when the week ends in the next month', () => {
    expect(monthLabelForWeek('2026-10-26')).toBe('October 2026');
  });

  test('follows the Thursday across a year boundary', () => {
    expect(monthLabelForWeek('2026-12-28')).toBe('December 2026');
    expect(monthLabelForWeek('2027-12-27')).toBe('December 2027');
    expect(monthLabelForWeek('2025-12-29')).toBe('January 2026');
  });
});

describe('selectedDateAfterWeekChange', () => {
  test('moves to the same weekday in the new week', () => {
    expect(
      selectedDateAfterWeekChange({ selectedDate: '2026-10-07', weekStart: '2026-10-12', today: '2026-10-05' }),
    ).toBe('2026-10-14');
  });

  test('moves to the same weekday in an earlier week', () => {
    expect(
      selectedDateAfterWeekChange({ selectedDate: '2026-10-04', weekStart: '2026-09-21', today: '2026-10-05' }),
    ).toBe('2026-09-27');
  });

  test('selects today when the new week contains it', () => {
    expect(
      selectedDateAfterWeekChange({ selectedDate: '2026-10-14', weekStart: '2026-10-05', today: '2026-10-08' }),
    ).toBe('2026-10-08');
  });

  test('keeps the selection when it is already in the new week', () => {
    expect(
      selectedDateAfterWeekChange({ selectedDate: '2026-10-09', weekStart: '2026-10-05', today: '2026-10-07' }),
    ).toBe('2026-10-09');
  });

  test('crosses a month boundary', () => {
    expect(
      selectedDateAfterWeekChange({ selectedDate: '2026-10-30', weekStart: '2026-11-02', today: '2026-10-05' }),
    ).toBe('2026-11-06');
  });
});

describe('isPageAligned', () => {
  test('true on a page boundary', () => {
    expect(isPageAligned(750, 375)).toBe(true);
  });

  test('true within half a point of a page boundary', () => {
    expect(isPageAligned(749.7, 375)).toBe(true);
    expect(isPageAligned(375.3, 375)).toBe(true);
  });

  test('false between pages', () => {
    expect(isPageAligned(500, 375)).toBe(false);
  });

  test('false without a page width', () => {
    expect(isPageAligned(0, 0)).toBe(false);
  });
});
