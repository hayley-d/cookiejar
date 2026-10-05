import { describe, expect, test } from 'bun:test';

import { pickNewerHealthSnapshot } from '@/health/pickNewerHealthSnapshot';
import type { HealthSnapshot } from '@/types/HealthSnapshot';

function snapshotFor(fetchedAt: string, restingHeartRate: number | null = 50): HealthSnapshot {
  return { date: '2026-10-01', steps: null, sleepMinutes: null, restingHeartRate, fetchedAt };
}

describe('pickNewerHealthSnapshot', () => {
  test('returns the incoming snapshot when there is no existing one', () => {
    const incoming = snapshotFor('2026-10-02T10:00:00.000Z');
    expect(pickNewerHealthSnapshot(null, incoming)).toBe(incoming);
    expect(pickNewerHealthSnapshot(undefined, incoming)).toBe(incoming);
  });

  test('returns null when both are missing', () => {
    expect(pickNewerHealthSnapshot(null, null)).toBeNull();
    expect(pickNewerHealthSnapshot(undefined, null)).toBeNull();
  });

  test('a missing incoming snapshot keeps the existing one', () => {
    const existing = snapshotFor('2026-10-02T10:00:00.000Z');
    expect(pickNewerHealthSnapshot(existing, null)).toBe(existing);
  });

  test('a later incoming snapshot wins', () => {
    const existing = snapshotFor('2026-10-02T10:00:00.000Z', 50);
    const incoming = snapshotFor('2026-10-02T11:00:00.000Z', 55);
    expect(pickNewerHealthSnapshot(existing, incoming)).toBe(incoming);
  });

  test('an older incoming snapshot never replaces a fresher one', () => {
    const existing = snapshotFor('2026-10-02T11:00:00.000Z', 55);
    const incoming = snapshotFor('2026-10-02T10:00:00.000Z', 50);
    expect(pickNewerHealthSnapshot(existing, incoming)).toBe(existing);
  });

  test('an equal fetchedAt takes the incoming snapshot', () => {
    const existing = snapshotFor('2026-10-02T10:00:00.000Z', 50);
    const incoming = snapshotFor('2026-10-02T10:00:00.000Z', 55);
    expect(pickNewerHealthSnapshot(existing, incoming)).toBe(incoming);
  });
});
