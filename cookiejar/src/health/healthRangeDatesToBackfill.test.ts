import { describe, expect, test } from 'bun:test';

import { healthRangeDatesToBackfill } from '@/health/healthRangeDatesToBackfill';
import type { HealthSnapshot } from '@/types/HealthSnapshot';

const now = new Date(2026, 9, 5, 15, 0);

function snapshotFor(date: string, fetchedAt: Date): HealthSnapshot {
  return { date, steps: 1, sleepMinutes: 1, restingHeartRate: 1, fetchedAt: fetchedAt.toISOString() };
}

const finalFetchedAt = new Date(2026, 9, 5, 13, 0);
const nonFinalFetchedAt = new Date(2026, 9, 3, 20, 0);

describe('healthRangeDatesToBackfill', () => {
  test('returns dates that have no snapshot', () => {
    expect(healthRangeDatesToBackfill(['2026-10-01', '2026-10-02'], [], now)).toEqual(['2026-10-01', '2026-10-02']);
  });

  test('returns dates whose snapshot is not final', () => {
    const snapshots = [snapshotFor('2026-10-03', nonFinalFetchedAt)];
    expect(healthRangeDatesToBackfill(['2026-10-03'], snapshots, now)).toEqual(['2026-10-03']);
  });

  test('always returns today', () => {
    const snapshots = [snapshotFor('2026-10-05', new Date(2026, 9, 5, 14, 0))];
    expect(healthRangeDatesToBackfill(['2026-10-05'], snapshots, now)).toEqual(['2026-10-05']);
  });

  test('skips final days', () => {
    const snapshots = [snapshotFor('2026-10-02', finalFetchedAt), snapshotFor('2026-10-03', nonFinalFetchedAt)];
    expect(healthRangeDatesToBackfill(['2026-10-02', '2026-10-03'], snapshots, now)).toEqual(['2026-10-03']);
  });

  test('keeps the order of the given dates', () => {
    const snapshots = [snapshotFor('2026-10-02', finalFetchedAt)];
    expect(healthRangeDatesToBackfill(['2026-10-04', '2026-10-02', '2026-10-01'], snapshots, now)).toEqual([
      '2026-10-04',
      '2026-10-01',
    ]);
  });
});
