import { describe, expect, test } from 'bun:test';

import { fitValueAxis } from '@/progress/fitValueAxis';

describe('fitValueAxis', () => {
  test('fits three evenly spaced round labels around the data, not from zero', () => {
    expect(fitValueAxis([70.2, 71.5, 72.8])).toEqual({ minimum: 70, maximum: 74, ticks: [70, 72, 74] });
  });

  test('widens the step until the data fits', () => {
    expect(fitValueAxis([70.5, 72.5])).toEqual({ minimum: 70, maximum: 74, ticks: [70, 72, 74] });
  });

  test('uses fractional steps for small spreads', () => {
    expect(fitValueAxis([72.1, 72.4])).toEqual({ minimum: 72.1, maximum: 72.5, ticks: [72.1, 72.3, 72.5] });
  });

  test('centres flat data', () => {
    expect(fitValueAxis([72, 72])).toEqual({ minimum: 71, maximum: 73, ticks: [71, 72, 73] });
  });

  test('handles large values', () => {
    expect(fitValueAxis([4200, 9800])).toEqual({ minimum: 4000, maximum: 10000, ticks: [4000, 7000, 10000] });
  });

  test('treats no values as flat data at zero', () => {
    expect(fitValueAxis([])).toEqual({ minimum: -1, maximum: 1, ticks: [-1, 0, 1] });
  });

  test('keeps every value inside the axis', () => {
    const values = [61.3, 64.9, 63.2];
    const axis = fitValueAxis(values);
    expect(axis.minimum).toBeLessThanOrEqual(61.3);
    expect(axis.maximum).toBeGreaterThanOrEqual(64.9);
  });
});
