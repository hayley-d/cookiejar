import { describe, expect, test } from 'bun:test';

import { isHealthSnapshotFinal } from '@/health/isHealthSnapshotFinal';

const now = new Date(2026, 9, 5, 15, 0);

function fetchedAtLocal(year: number, monthIndex: number, day: number, hours: number, minutes = 0) {
  return new Date(year, monthIndex, day, hours, minutes).toISOString();
}

describe('isHealthSnapshotFinal', () => {
  test('today is never final', () => {
    expect(isHealthSnapshotFinal({ date: '2026-10-05', fetchedAt: fetchedAtLocal(2026, 9, 5, 14) }, now)).toBe(false);
  });

  test('a future date is never final', () => {
    expect(isHealthSnapshotFinal({ date: '2026-10-06', fetchedAt: fetchedAtLocal(2026, 9, 7, 13) }, now)).toBe(false);
  });

  test('a past day fetched after noon on the following day is final', () => {
    expect(isHealthSnapshotFinal({ date: '2026-10-04', fetchedAt: fetchedAtLocal(2026, 9, 5, 12, 1) }, now)).toBe(true);
    expect(isHealthSnapshotFinal({ date: '2026-10-01', fetchedAt: fetchedAtLocal(2026, 9, 5, 9) }, now)).toBe(true);
  });

  test('a past day fetched at or before noon on the following day is not final', () => {
    expect(isHealthSnapshotFinal({ date: '2026-10-04', fetchedAt: fetchedAtLocal(2026, 9, 5, 12) }, now)).toBe(false);
    expect(isHealthSnapshotFinal({ date: '2026-10-04', fetchedAt: fetchedAtLocal(2026, 9, 5, 8) }, now)).toBe(false);
  });

  test('a past day fetched on the day itself is not final', () => {
    expect(isHealthSnapshotFinal({ date: '2026-10-04', fetchedAt: fetchedAtLocal(2026, 9, 4, 23, 59) }, now)).toBe(false);
  });

  test('handles a following day in the next month', () => {
    expect(isHealthSnapshotFinal({ date: '2026-09-30', fetchedAt: fetchedAtLocal(2026, 9, 1, 12, 30) }, now)).toBe(true);
    expect(isHealthSnapshotFinal({ date: '2026-09-30', fetchedAt: fetchedAtLocal(2026, 9, 1, 11, 30) }, now)).toBe(false);
  });
});
