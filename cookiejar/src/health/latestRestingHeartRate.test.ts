import { describe, expect, test } from 'bun:test';

import { latestRestingHeartRate } from '@/health/latestRestingHeartRate';
import type { HealthSnapshot } from '@/types/HealthSnapshot';

function snapshotFor(date: string, restingHeartRate: number | null): HealthSnapshot {
  return { date, steps: 100, sleepMinutes: null, restingHeartRate, fetchedAt: '2026-10-06T08:00:00.000Z' };
}

const previousDates = ['2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'];

describe('latestRestingHeartRate', () => {
  test("uses today's reading when there is one", () => {
    const previousSnapshots = new Map([['2026-10-05', snapshotFor('2026-10-05', 60)]]);
    expect(latestRestingHeartRate(snapshotFor('2026-10-06', 52), previousDates, previousSnapshots)).toEqual({
      beatsPerMinute: 52,
      date: '2026-10-06',
    });
  });

  test('falls back to the most recent earlier day with a reading', () => {
    const previousSnapshots = new Map([
      ['2026-10-02', snapshotFor('2026-10-02', 57)],
      ['2026-10-03', snapshotFor('2026-10-03', 58)],
      ['2026-10-04', snapshotFor('2026-10-04', null)],
      ['2026-10-05', snapshotFor('2026-10-05', null)],
    ]);
    expect(latestRestingHeartRate(snapshotFor('2026-10-06', null), previousDates, previousSnapshots)).toEqual({
      beatsPerMinute: 58,
      date: '2026-10-03',
    });
  });

  test('returns null when no day has a reading', () => {
    expect(latestRestingHeartRate(null, previousDates, new Map())).toBeNull();
  });
});
