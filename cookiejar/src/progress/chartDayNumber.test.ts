import { describe, expect, test } from 'bun:test';

import { chartDayTicks, fromChartDayNumber, toChartDayNumber } from '@/progress/chartDayNumber';

describe('chartDayNumber', () => {
  test('places dates by the real number of days between them', () => {
    expect(toChartDayNumber('2026-10-05') - toChartDayNumber('2026-10-01')).toBe(4);
    expect(toChartDayNumber('2026-03-01') - toChartDayNumber('2026-02-28')).toBe(1);
    expect(toChartDayNumber('2027-01-01') - toChartDayNumber('2026-01-01')).toBe(365);
  });

  test('is a whole number across daylight saving changes', () => {
    expect(Number.isInteger(toChartDayNumber('2026-03-29'))).toBe(true);
    expect(toChartDayNumber('2026-10-26') - toChartDayNumber('2026-10-24')).toBe(2);
  });

  test('converts a day number back to its date', () => {
    expect(fromChartDayNumber(toChartDayNumber('2026-10-05'))).toBe('2026-10-05');
    expect(fromChartDayNumber(toChartDayNumber('2028-02-29'))).toBe('2028-02-29');
  });

  test('rounds a fractional day number to the nearest day', () => {
    expect(fromChartDayNumber(toChartDayNumber('2026-10-05') + 0.4)).toBe('2026-10-05');
  });
});

describe('chartDayTicks', () => {
  test('labels the first, middle and last day', () => {
    expect(chartDayTicks([100, 104, 110])).toEqual([100, 105, 110]);
  });

  test('drops repeated ticks when the days are close together', () => {
    expect(chartDayTicks([100, 101])).toEqual([100, 101]);
    expect(chartDayTicks([100])).toEqual([100]);
  });

  test('has no ticks without days', () => {
    expect(chartDayTicks([])).toEqual([]);
  });
});
