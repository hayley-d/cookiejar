import { describe, expect, test } from 'bun:test';

import { healthRefreshWindowMilliseconds, shouldRefreshHealth } from '@/health/shouldRefreshHealth';

const now = new Date(2026, 9, 5, 9, 30).getTime();

describe('shouldRefreshHealth', () => {
  test('refreshes when the date has never been refreshed', () => {
    expect(shouldRefreshHealth(null, now)).toBe(true);
  });

  test('skips a refresh inside the five minute window', () => {
    expect(shouldRefreshHealth(now, now)).toBe(false);
    expect(shouldRefreshHealth(now - 60 * 1000, now)).toBe(false);
    expect(shouldRefreshHealth(now - healthRefreshWindowMilliseconds + 1, now)).toBe(false);
  });

  test('refreshes once the five minute window has passed', () => {
    expect(shouldRefreshHealth(now - healthRefreshWindowMilliseconds, now)).toBe(true);
    expect(shouldRefreshHealth(now - 60 * 60 * 1000, now)).toBe(true);
  });

  test('refreshes when the clock has moved backwards', () => {
    expect(shouldRefreshHealth(now + 60 * 1000, now)).toBe(true);
  });

  test('uses a five minute window', () => {
    expect(healthRefreshWindowMilliseconds).toBe(300000);
  });
});
