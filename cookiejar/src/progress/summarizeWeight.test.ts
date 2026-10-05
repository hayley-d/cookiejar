import { describe, expect, test } from 'bun:test';

import { summarizeWeight } from '@/progress/summarizeWeight';

const today = '2026-10-05';

describe('summarizeWeight', () => {
  test('uses the last-entered weight of a day as latest, with repository DESC input order', () => {
    const measurements = [
      { id: 3, measuredOn: today, weightKilograms: 72 },
      { id: 2, measuredOn: today, weightKilograms: 72.5 },
      { id: 1, measuredOn: '2026-09-05', weightKilograms: 73 },
    ];
    expect(summarizeWeight(measurements, 30, today)).toEqual({ latestWeightKilograms: 72, change: -1 });
  });

  test('is null with no weights and has a null change with one', () => {
    expect(summarizeWeight([{ id: 1, measuredOn: today, weightKilograms: null }], 30, today)).toBeNull();
    expect(summarizeWeight([{ id: 1, measuredOn: today, weightKilograms: 72 }], 30, today)).toEqual({
      latestWeightKilograms: 72,
      change: null,
    });
  });
});
