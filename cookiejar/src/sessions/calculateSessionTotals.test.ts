import { describe, expect, test } from 'bun:test';

import { calculateSessionTotals, elapsedSecondsBetween } from '@/sessions/calculateSessionTotals';

const completedAt = '2026-10-05T08:10:00Z';

describe('calculateSessionTotals', () => {
  test('sums volume and counts only completed sets', () => {
    const totals = calculateSessionTotals(
      {
        startedAt: '2026-10-05T08:00:00Z',
        finishedAt: '2026-10-05T08:52:00Z',
        exercises: [
          {
            sets: [
              { weightKilograms: 60, repetitions: 8, completedAt },
              { weightKilograms: 62.5, repetitions: 8, completedAt },
              { weightKilograms: 65, repetitions: 8, completedAt: null },
            ],
          },
          {
            sets: [
              { weightKilograms: null, repetitions: 15, completedAt },
              { weightKilograms: null, repetitions: null, completedAt },
            ],
          },
        ],
      },
      new Date('2026-10-05T12:00:00Z'),
    );
    expect(totals).toEqual({ durationSeconds: 52 * 60, volumeKilograms: 980, completedSetCount: 4 });
  });

  test('an unfinished session measures its duration up to now', () => {
    const totals = calculateSessionTotals(
      { startedAt: '2026-10-05T08:00:00Z', finishedAt: null, exercises: [] },
      new Date('2026-10-05T08:23:41Z'),
    );
    expect(totals).toEqual({ durationSeconds: 23 * 60 + 41, volumeKilograms: 0, completedSetCount: 0 });
  });
});

describe('elapsedSecondsBetween', () => {
  test('never goes below zero', () => {
    expect(elapsedSecondsBetween('2026-10-05T08:00:00Z', new Date('2026-10-05T07:59:00Z'))).toBe(0);
  });

  test('an unreadable start time counts as zero', () => {
    expect(elapsedSecondsBetween('not a date', new Date('2026-10-05T08:00:00Z'))).toBe(0);
  });
});
