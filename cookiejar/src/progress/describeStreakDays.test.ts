import { describe, expect, test } from 'bun:test';

import { describeStreakDays } from '@/progress/describeStreakDays';

describe('describeStreakDays', () => {
  test('joins the spoken state of each day', () => {
    expect(
      describeStreakDays([
        { date: '2026-10-05', state: 'completed' },
        { date: '2026-10-06', state: 'unplanned' },
        { date: '2026-10-07', state: 'missed' },
        { date: '2026-10-08', state: 'rest' },
        { date: '2026-10-09', state: 'pending' },
      ]),
    ).toBe('done, done, missed, rest, to do');
  });

  test('returns an empty string for no days', () => {
    expect(describeStreakDays([])).toBe('');
  });
});
