import { describe, expect, test } from 'bun:test';

import { defaultSwimDurationSeconds, swimFinishedAt } from '@/swimming/swimDuration';

const startedAt = '2026-10-12T10:00:00.000Z';

describe('defaultSwimDurationSeconds', () => {
  test('is the time since the swim started', () => {
    expect(defaultSwimDurationSeconds(startedAt, new Date('2026-10-12T10:42:17.000Z'))).toBe(2537);
  });

  test('is never negative', () => {
    expect(defaultSwimDurationSeconds(startedAt, new Date('2026-10-12T09:00:00.000Z'))).toBe(0);
  });
});

describe('swimFinishedAt', () => {
  test('adds the duration to the start', () => {
    expect(swimFinishedAt(startedAt, 2400)).toBe('2026-10-12T10:40:00.000Z');
  });
});
