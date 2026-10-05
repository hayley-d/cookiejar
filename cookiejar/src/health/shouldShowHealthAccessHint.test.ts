import { describe, expect, test } from 'bun:test';

import type { DailyHealth } from '@/health/HealthTypes';
import { shouldShowHealthAccessHint } from '@/health/shouldShowHealthAccessHint';

const emptySnapshot: DailyHealth = { date: '2026-10-05', steps: null, sleepMinutes: null, restingHeartRate: null };

describe('shouldShowHealthAccessHint', () => {
  test('shows when access was requested and every value is null', () => {
    expect(shouldShowHealthAccessHint(true, emptySnapshot)).toBe(true);
  });

  test('hides when any value is present', () => {
    expect(shouldShowHealthAccessHint(true, { ...emptySnapshot, steps: 0 })).toBe(false);
    expect(shouldShowHealthAccessHint(true, { ...emptySnapshot, sleepMinutes: 400 })).toBe(false);
    expect(shouldShowHealthAccessHint(true, { ...emptySnapshot, restingHeartRate: 55 })).toBe(false);
  });

  test('hides when access was never requested', () => {
    expect(shouldShowHealthAccessHint(false, emptySnapshot)).toBe(false);
  });

  test('hides while the request state is unknown', () => {
    expect(shouldShowHealthAccessHint(null, emptySnapshot)).toBe(false);
  });

  test('hides when there is no snapshot yet', () => {
    expect(shouldShowHealthAccessHint(true, null)).toBe(false);
  });
});
