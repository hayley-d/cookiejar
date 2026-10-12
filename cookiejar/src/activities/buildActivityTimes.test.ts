import { describe, expect, test } from 'bun:test';

import { buildActivityTimes } from '@/activities/buildActivityTimes';

describe('buildActivityTimes', () => {
  test('starts at the chosen date and start time and finishes after the duration', () => {
    const times = buildActivityTimes('2026-10-11', new Date(2026, 9, 12, 7, 45, 30), 55 * 60);
    expect(new Date(times.startedAt).getTime()).toBe(new Date(2026, 9, 11, 7, 45).getTime());
    expect(new Date(times.finishedAt).getTime()).toBe(new Date(2026, 9, 11, 8, 40).getTime());
  });

  test('finishes on the next day when the activity crosses midnight', () => {
    const times = buildActivityTimes('2026-10-11', new Date(2026, 9, 11, 23, 30), 90 * 60);
    expect(new Date(times.finishedAt).getTime()).toBe(new Date(2026, 9, 12, 1, 0).getTime());
  });
});
