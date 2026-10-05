import { describe, expect, test } from 'bun:test';

import { calculateWeightChange } from '@/progress/calculateWeightChange';

const today = '2026-10-05';

function weighIn(measuredOn: string, weightKilograms: number | null) {
  return { measuredOn, weightKilograms };
}

describe('calculateWeightChange', () => {
  test('is null with fewer than 2 weights', () => {
    expect(calculateWeightChange([], 30, today)).toBeNull();
    expect(calculateWeightChange([weighIn('2026-10-05', 72)], 30, today)).toBeNull();
    expect(calculateWeightChange([weighIn('2026-10-05', 72), weighIn('2026-09-01', null)], 30, today)).toBeNull();
  });

  test('uses the weight on or just before N days earlier as the baseline', () => {
    const measurements = [
      weighIn('2026-10-05', 72.4),
      weighIn('2026-09-20', 70),
      weighIn('2026-09-05', 73),
      weighIn('2026-08-01', 80),
    ];
    expect(calculateWeightChange(measurements, 30, today)).toBe(-0.6);
  });

  test('falls back to the oldest weight inside the window', () => {
    const measurements = [weighIn('2026-10-05', 72.4), weighIn('2026-09-25', 73), weighIn('2026-09-10', 74)];
    expect(calculateWeightChange(measurements, 30, today)).toBe(-1.6);
  });

  test('ignores measurements without a weight', () => {
    const measurements = [weighIn('2026-10-05', 72), weighIn('2026-09-20', null), weighIn('2026-09-05', 73)];
    expect(calculateWeightChange(measurements, 30, today)).toBe(-1);
  });

  test('compares two weigh-ins on the same day as separate rows', () => {
    expect(calculateWeightChange([weighIn('2026-10-05', 72.5), weighIn('2026-10-05', 72)], 30, today)).toBe(-0.5);
  });

  test('does not depend on input order and reports gains as positive', () => {
    const measurements = [weighIn('2026-09-05', 70), weighIn('2026-10-05', 71.2)];
    expect(calculateWeightChange(measurements, 30, today)).toBe(1.2);
  });

  test('ignores weights dated after today', () => {
    const measurements = [weighIn('2026-10-06', 90), weighIn('2026-10-05', 72), weighIn('2026-09-05', 73)];
    expect(calculateWeightChange(measurements, 30, today)).toBe(-1);
  });

  test('reports no change as 0', () => {
    expect(calculateWeightChange([weighIn('2026-10-05', 72), weighIn('2026-09-05', 72)], 30, today)).toBe(0);
  });
});
