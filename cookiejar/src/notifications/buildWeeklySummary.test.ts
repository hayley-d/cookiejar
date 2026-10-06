import { describe, expect, test } from 'bun:test';

import { buildWeeklySummary } from '@/notifications/buildWeeklySummary';

const wednesday = new Date(2026, 9, 7, 12, 0);

describe('buildWeeklySummary', () => {
  test('builds the text, fire time and identifier', () => {
    const summary = buildWeeklySummary({ completedCount: 4, plannedCount: 5, recordCount: 2, now: wednesday });
    expect(summary.title).toBe('Noop noop! 🦄');
    expect(summary.body).toBe('This week: 4/5 workouts, 2 new records 🏆');
    expect(summary.fireAt).toEqual(new Date(2026, 9, 11, 19, 0, 0, 0));
    expect(summary.identifier).toBe('weekly-summary:2026-10-11');
  });

  test('uses the coach nuggie, the coach route and the default sound', () => {
    const summary = buildWeeklySummary({ completedCount: 4, plannedCount: 5, recordCount: 2, now: wednesday });
    expect(summary.nuggie).toBe('coach');
    expect(summary.route).toBe('/coach');
    expect(summary.playsSound).toBe(true);
  });

  test('keys the identifier to the next Sunday after Sunday at 19:00', () => {
    const summary = buildWeeklySummary({
      completedCount: 1,
      plannedCount: 1,
      recordCount: 0,
      now: new Date(2026, 9, 11, 19, 0),
    });
    expect(summary.identifier).toBe('weekly-summary:2026-10-18');
  });

  test('reads one record in the singular', () => {
    const summary = buildWeeklySummary({ completedCount: 3, plannedCount: 4, recordCount: 1, now: wednesday });
    expect(summary.body).toBe('This week: 3/4 workouts, 1 new record 🏆');
  });

  test('drops the records clause when there are none', () => {
    const summary = buildWeeklySummary({ completedCount: 3, plannedCount: 4, recordCount: 0, now: wednesday });
    expect(summary.body).toBe('This week: 3/4 workouts 💪');
  });

  test('reads the done count when nothing was planned', () => {
    const summary = buildWeeklySummary({ completedCount: 2, plannedCount: 0, recordCount: 0, now: wednesday });
    expect(summary.body).toBe('This week: 2 workouts done 💪');
  });

  test('reads one done workout in the singular when nothing was planned', () => {
    const summary = buildWeeklySummary({ completedCount: 1, plannedCount: 0, recordCount: 1, now: wednesday });
    expect(summary.body).toBe('This week: 1 workout done, 1 new record 🏆');
  });

  test('calls it a rest week when nothing was planned or done', () => {
    const summary = buildWeeklySummary({ completedCount: 0, plannedCount: 0, recordCount: 0, now: wednesday });
    expect(summary.body).toBe("Rest week! Nuggie's proud of you anyway 🦄");
  });
});
