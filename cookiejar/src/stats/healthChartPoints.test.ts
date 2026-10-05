import { describe, expect, test } from 'bun:test';

import { averageOfPoints, healthChartPoints } from '@/stats/healthChartPoints';
import type { HealthSnapshot } from '@/types/HealthSnapshot';

function snapshot(values: Partial<HealthSnapshot>): HealthSnapshot {
  return { steps: null, sleepMinutes: null, restingHeartRate: null, ...values } as HealthSnapshot;
}

const dates = ['2026-10-01', '2026-10-02', '2026-10-03'];
const snapshots = new Map<string, HealthSnapshot>([
  ['2026-10-01', snapshot({ steps: 8000, sleepMinutes: 435, restingHeartRate: 60 })],
  ['2026-10-03', snapshot({ steps: 0, sleepMinutes: null, restingHeartRate: 64 })],
]);

describe('healthChartPoints', () => {
  test('omits days with no snapshot or no value, keeping zero values', () => {
    expect(healthChartPoints('steps', dates, snapshots)).toEqual([
      { date: '2026-10-01', value: 8000 },
      { date: '2026-10-03', value: 0 },
    ]);
  });

  test('converts sleep minutes to hours with one decimal', () => {
    expect(healthChartPoints('sleep', dates, snapshots)).toEqual([{ date: '2026-10-01', value: 7.3 }]);
  });

  test('reads resting heart rate', () => {
    expect(healthChartPoints('restingHeartRate', dates, snapshots)).toEqual([
      { date: '2026-10-01', value: 60 },
      { date: '2026-10-03', value: 64 },
    ]);
  });
});

describe('averageOfPoints', () => {
  test('averages only the points present', () => {
    expect(
      averageOfPoints([
        { date: '2026-10-01', value: 60 },
        { date: '2026-10-03', value: 64 },
      ]),
    ).toBe(62);
  });

  test('is undefined with no points', () => {
    expect(averageOfPoints([])).toBeUndefined();
  });
});
