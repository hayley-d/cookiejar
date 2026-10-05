import { describe, expect, test } from 'bun:test';

import { describeActiveSessionBanner, elapsedWholeMinutes } from '@/sessions/describeActiveSessionBanner';

const startedAt = '2026-10-05T08:00:00Z';

describe('describeActiveSessionBanner', () => {
  test('shows zero minutes just after the start', () => {
    expect(describeActiveSessionBanner(startedAt, new Date('2026-10-05T08:00:30Z'))).toBe(
      'Workout in progress · 0 min — Resume',
    );
  });

  test('counts whole minutes only', () => {
    expect(elapsedWholeMinutes(startedAt, new Date('2026-10-05T08:23:59Z'))).toBe(23);
  });

  test('shows the long-running total', () => {
    expect(describeActiveSessionBanner(startedAt, new Date('2026-10-05T10:05:00Z'))).toBe(
      'Workout in progress · 125 min — Resume',
    );
  });

  test('never goes negative when the clock is behind the start', () => {
    expect(elapsedWholeMinutes(startedAt, new Date('2026-10-05T07:50:00Z'))).toBe(0);
  });
});
