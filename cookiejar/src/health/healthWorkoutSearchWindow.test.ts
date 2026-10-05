import { describe, expect, test } from 'bun:test';

import { healthWorkoutSearchWindow } from '@/health/healthWorkoutSearchWindow';

describe('healthWorkoutSearchWindow', () => {
  test('pads the session by 30 minutes on both sides', () => {
    const window = healthWorkoutSearchWindow('2026-10-05T10:00:00.000Z', '2026-10-05T11:00:00.000Z', new Date());
    expect(window.startDate.toISOString()).toBe('2026-10-05T09:30:00.000Z');
    expect(window.endDate.toISOString()).toBe('2026-10-05T11:30:00.000Z');
  });

  test('uses now when the session is unfinished', () => {
    const window = healthWorkoutSearchWindow('2026-10-05T10:00:00.000Z', null, new Date('2026-10-05T10:20:00.000Z'));
    expect(window.endDate.toISOString()).toBe('2026-10-05T10:50:00.000Z');
  });
});
