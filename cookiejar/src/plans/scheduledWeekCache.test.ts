import { describe, expect, test } from 'bun:test';

import {
  emptyScheduledWeekCache,
  mergeLoadedWeeks,
  missingWeekStarts,
  scheduledWorkoutsForDate,
  weekStartsAroundVisible,
  type ScheduledWeek,
} from '@/plans/scheduledWeekCache';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

function readyWeek(date: string, scheduledWorkouts: ScheduledWorkout[]): ScheduledWeek {
  return { outcome: 'ready', scheduledWorkoutsByDate: new Map([[date, scheduledWorkouts]]) };
}

describe('weekStartsAroundVisible', () => {
  test('lists the previous, visible and next weeks', () => {
    expect(weekStartsAroundVisible('2026-10-05')).toEqual(['2026-09-28', '2026-10-05', '2026-10-12']);
  });
});

describe('missingWeekStarts', () => {
  test('reports all three weeks for an empty cache', () => {
    expect(missingWeekStarts(emptyScheduledWeekCache, '2026-10-05')).toEqual([
      '2026-09-28',
      '2026-10-05',
      '2026-10-12',
    ]);
  });

  test('reports only the weeks not cached', () => {
    const cache = mergeLoadedWeeks(
      emptyScheduledWeekCache,
      new Map([
        ['2026-09-28', readyWeek('2026-09-28', [])],
        ['2026-10-05', readyWeek('2026-10-05', [])],
      ]),
    );
    expect(missingWeekStarts(cache, '2026-10-12')).toEqual(['2026-10-12', '2026-10-19']);
  });

  test('reports nothing when the whole window is cached', () => {
    const cache = mergeLoadedWeeks(
      emptyScheduledWeekCache,
      new Map([
        ['2026-09-28', { outcome: 'failed' }],
        ['2026-10-05', readyWeek('2026-10-05', [])],
        ['2026-10-12', readyWeek('2026-10-12', [])],
      ]),
    );
    expect(missingWeekStarts(cache, '2026-10-05')).toEqual([]);
  });
});

describe('mergeLoadedWeeks', () => {
  test('keeps existing weeks and adds new ones without mutating the cache', () => {
    const first = mergeLoadedWeeks(emptyScheduledWeekCache, new Map([['2026-10-05', readyWeek('2026-10-05', [])]]));
    const second = mergeLoadedWeeks(first, new Map([['2026-10-12', readyWeek('2026-10-12', [])]]));
    expect([...second.keys()]).toEqual(['2026-10-05', '2026-10-12']);
    expect(first.size).toBe(1);
    expect(emptyScheduledWeekCache.size).toBe(0);
  });

  test('replaces a week that is loaded again', () => {
    const first = mergeLoadedWeeks(emptyScheduledWeekCache, new Map([['2026-10-05', { outcome: 'failed' }]]));
    const second = mergeLoadedWeeks(first, new Map([['2026-10-05', readyWeek('2026-10-05', [])]]));
    expect(second.get('2026-10-05')?.outcome).toBe('ready');
  });
});

describe('scheduledWorkoutsForDate', () => {
  const scheduledWorkout = { date: '2026-10-07' } as ScheduledWorkout;

  test('is loading when the week is not cached', () => {
    expect(scheduledWorkoutsForDate(emptyScheduledWeekCache, '2026-10-07')).toEqual({ status: 'loading' });
  });

  test('is failed when the week failed', () => {
    const cache = mergeLoadedWeeks(emptyScheduledWeekCache, new Map([['2026-10-05', { outcome: 'failed' }]]));
    expect(scheduledWorkoutsForDate(cache, '2026-10-07')).toEqual({ status: 'failed' });
  });

  test('returns the workouts for the date from its week', () => {
    const cache = mergeLoadedWeeks(
      emptyScheduledWeekCache,
      new Map([['2026-10-05', readyWeek('2026-10-07', [scheduledWorkout])]]),
    );
    expect(scheduledWorkoutsForDate(cache, '2026-10-07')).toEqual({
      status: 'ready',
      scheduledWorkouts: [scheduledWorkout],
    });
    expect(scheduledWorkoutsForDate(cache, '2026-10-08')).toEqual({ status: 'ready', scheduledWorkouts: [] });
  });
});
