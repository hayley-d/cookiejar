import { describe, expect, test } from 'bun:test';

import { selectWeightPoints } from '@/progress/selectWeightPoints';

describe('selectWeightPoints', () => {
  test('gives one point per weigh-in in date order', () => {
    expect(
      selectWeightPoints(
        [
          { id: 3, measuredOn: '2026-10-01', weightKilograms: 72 },
          { id: 1, measuredOn: '2026-09-01', weightKilograms: 74 },
          { id: 2, measuredOn: '2026-09-15', weightKilograms: 73 },
        ],
        '2026-10-05',
      ),
    ).toEqual([
      { date: '2026-09-01', value: 74 },
      { date: '2026-09-15', value: 73 },
      { date: '2026-10-01', value: 72 },
    ]);
  });

  test('keeps the last entered weigh-in when two share a date', () => {
    expect(
      selectWeightPoints(
        [
          { id: 5, measuredOn: '2026-10-01', weightKilograms: 71.5 },
          { id: 4, measuredOn: '2026-10-01', weightKilograms: 72 },
          { id: 1, measuredOn: '2026-09-01', weightKilograms: 74 },
        ],
        '2026-10-05',
      ),
    ).toEqual([
      { date: '2026-09-01', value: 74 },
      { date: '2026-10-01', value: 71.5 },
    ]);
  });

  test('ignores measurements without a weight and future dates', () => {
    expect(
      selectWeightPoints(
        [
          { id: 1, measuredOn: '2026-09-01', weightKilograms: null },
          { id: 2, measuredOn: '2026-09-02', weightKilograms: 73 },
          { id: 3, measuredOn: '2026-10-06', weightKilograms: 72 },
        ],
        '2026-10-05',
      ),
    ).toEqual([{ date: '2026-09-02', value: 73 }]);
  });
});
