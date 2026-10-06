import { describe, expect, test } from 'bun:test';

import { describeStreakStatDays } from '@/stats/describeStatDays';
import { summarizeHealthMetric, summarizeStreakDays } from '@/stats/summarizeStatDays';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

const dates = ['2026-10-03', '2026-10-02', '2026-10-01', '2026-09-30'];

describe('summarizeHealthMetric', () => {
  test('summarises steps with goal days', () => {
    expect(summarizeHealthMetric('steps', dates, [7837, 4610, null, 1470], 5000)).toEqual([
      { label: 'Average', value: '4,639' },
      { label: 'Best day', value: '7,837', caption: 'Sat 3 Oct' },
      { label: 'Goal reached', value: '1 / 3', caption: 'days' },
    ]);
  });

  test('summarises sleep with short nights', () => {
    expect(summarizeHealthMetric('sleep', dates, [480, 300, 420, null], 5000)).toEqual([
      { label: 'Average', value: '6h 40m' },
      { label: 'Longest', value: '8h 0m', caption: 'Sat 3 Oct' },
      { label: 'Under 6h', value: '1 / 3', caption: 'nights' },
    ]);
  });

  test('summarises resting heart rate range', () => {
    expect(summarizeHealthMetric('restingHeartRate', dates, [58, 47, 55, null], 5000)).toEqual([
      { label: 'Average', value: '53 bpm' },
      { label: 'Lowest', value: '47 bpm', caption: 'Fri 2 Oct' },
      { label: 'Highest', value: '58 bpm', caption: 'Sat 3 Oct' },
    ]);
  });

  test('is empty without any data', () => {
    expect(summarizeHealthMetric('steps', dates, [null, null, null, null], 5000)).toEqual([]);
  });
});

describe('summarizeStreakDays', () => {
  test('counts completed, trained days and missed workouts', () => {
    const completed = { status: 'completed', planEntryId: 1 } as ScheduledWorkout;
    const planned = { status: 'planned', planEntryId: 2 } as ScheduledWorkout;
    const statDays = describeStreakStatDays(
      ['2026-10-06', '2026-10-05', '2026-10-04'],
      new Map([
        ['2026-10-05', [completed, planned]],
        ['2026-10-04', [completed]],
        ['2026-10-06', [planned]],
      ]),
      '2026-10-06',
    );
    expect(summarizeStreakDays(statDays)).toEqual([
      { label: 'Completed', value: '2 / 4', caption: 'workouts' },
      { label: 'Days trained', value: '2' },
      { label: 'Missed', value: '1' },
    ]);
  });
});
