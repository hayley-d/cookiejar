import { describe, expect, test } from 'bun:test';

import { mergeHealthSnapshots } from '@/health/mergeHealthSnapshots';
import type { HealthSnapshot } from '@/types/HealthSnapshot';

function snapshotFor(date: string, fetchedAt: string, restingHeartRate: number | null = 50): HealthSnapshot {
  return { date, steps: null, sleepMinutes: null, restingHeartRate, fetchedAt };
}

describe('mergeHealthSnapshots', () => {
  test('adds snapshots for new dates', () => {
    const existing = new Map([['2026-10-01', snapshotFor('2026-10-01', '2026-10-02T10:00:00.000Z')]]);
    const merged = mergeHealthSnapshots(existing, [snapshotFor('2026-10-02', '2026-10-03T10:00:00.000Z')]);
    expect([...merged.keys()]).toEqual(['2026-10-01', '2026-10-02']);
  });

  test('a later fetchedAt replaces the existing snapshot', () => {
    const existing = new Map([['2026-10-01', snapshotFor('2026-10-01', '2026-10-02T10:00:00.000Z', 50)]]);
    const merged = mergeHealthSnapshots(existing, [snapshotFor('2026-10-01', '2026-10-02T11:00:00.000Z', 55)]);
    expect(merged.get('2026-10-01')?.restingHeartRate).toBe(55);
  });

  test('an older cached snapshot never replaces a fresher one', () => {
    const existing = new Map([['2026-10-01', snapshotFor('2026-10-01', '2026-10-02T11:00:00.000Z', 55)]]);
    const merged = mergeHealthSnapshots(existing, [snapshotFor('2026-10-01', '2026-10-02T10:00:00.000Z', 50)]);
    expect(merged.get('2026-10-01')?.restingHeartRate).toBe(55);
  });

  test('does not mutate the existing map', () => {
    const existing = new Map<string, HealthSnapshot>();
    const merged = mergeHealthSnapshots(existing, [snapshotFor('2026-10-01', '2026-10-02T10:00:00.000Z')]);
    expect(existing.size).toBe(0);
    expect(merged.size).toBe(1);
  });
});
