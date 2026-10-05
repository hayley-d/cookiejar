import { describe, expect, test } from 'bun:test';

import { isHealthSnapshotFinal } from '@/health/isHealthSnapshotFinal';
import type { HealthSnapshot } from '@/types/HealthSnapshot';

const now = new Date(2026, 9, 5, 15, 0);

function fetchedAtLocal(year: number, monthIndex: number, day: number, hours: number, minutes = 0) {
  return new Date(year, monthIndex, day, hours, minutes).toISOString();
}

function snapshotOn(date: string, fetchedAt: string, overrides: Partial<HealthSnapshot> = {}): HealthSnapshot {
  return { date, steps: 1, sleepMinutes: 1, restingHeartRate: 1, fetchedAt, ...overrides };
}

describe('isHealthSnapshotFinal', () => {
  test('today is never final', () => {
    expect(isHealthSnapshotFinal(snapshotOn('2026-10-05', fetchedAtLocal(2026, 9, 5, 14)), now)).toBe(false);
  });

  test('a future date is never final', () => {
    expect(isHealthSnapshotFinal(snapshotOn('2026-10-06', fetchedAtLocal(2026, 9, 7, 13)), now)).toBe(false);
  });

  test('a past day fetched after noon on the following day is final', () => {
    expect(isHealthSnapshotFinal(snapshotOn('2026-10-04', fetchedAtLocal(2026, 9, 5, 12, 1)), now)).toBe(true);
    expect(isHealthSnapshotFinal(snapshotOn('2026-10-01', fetchedAtLocal(2026, 9, 5, 9)), now)).toBe(true);
  });

  test('a past day fetched at or before noon on the following day is not final', () => {
    expect(isHealthSnapshotFinal(snapshotOn('2026-10-04', fetchedAtLocal(2026, 9, 5, 12)), now)).toBe(false);
    expect(isHealthSnapshotFinal(snapshotOn('2026-10-04', fetchedAtLocal(2026, 9, 5, 8)), now)).toBe(false);
  });

  test('a past day fetched on the day itself is not final', () => {
    expect(isHealthSnapshotFinal(snapshotOn('2026-10-04', fetchedAtLocal(2026, 9, 4, 23, 59)), now)).toBe(false);
  });

  test('handles a following day in the next month', () => {
    expect(isHealthSnapshotFinal(snapshotOn('2026-09-30', fetchedAtLocal(2026, 9, 1, 12, 30)), now)).toBe(true);
    expect(isHealthSnapshotFinal(snapshotOn('2026-09-30', fetchedAtLocal(2026, 9, 1, 11, 30)), now)).toBe(false);
  });

  test('an all-null snapshot is never final', () => {
    const allNull = { steps: null, sleepMinutes: null, restingHeartRate: null };
    expect(isHealthSnapshotFinal(snapshotOn('2026-10-01', fetchedAtLocal(2026, 9, 5, 9), allNull), now)).toBe(false);
  });

  test('a past day with any single value can be final', () => {
    const fetchedAt = fetchedAtLocal(2026, 9, 5, 9);
    const nullsExcept = (key: 'steps' | 'sleepMinutes' | 'restingHeartRate') => ({
      steps: null,
      sleepMinutes: null,
      restingHeartRate: null,
      [key]: 0,
    });
    expect(isHealthSnapshotFinal(snapshotOn('2026-10-01', fetchedAt, nullsExcept('steps')), now)).toBe(true);
    expect(isHealthSnapshotFinal(snapshotOn('2026-10-01', fetchedAt, nullsExcept('sleepMinutes')), now)).toBe(true);
    expect(isHealthSnapshotFinal(snapshotOn('2026-10-01', fetchedAt, nullsExcept('restingHeartRate')), now)).toBe(true);
  });
});
