import { describe, expect, test } from 'bun:test';

import { describeHealthStatDays, describeStreakStatDays, formatSignedDifference } from '@/stats/describeStatDays';
import type { HealthSnapshot } from '@/types/HealthSnapshot';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

function snapshotFor(date: string, values: Partial<HealthSnapshot>): HealthSnapshot {
  return { date, steps: null, sleepMinutes: null, restingHeartRate: null, fetchedAt: '2026-10-06T08:00:00.000Z', ...values };
}

describe('formatSignedDifference', () => {
  test('signs positive and negative differences', () => {
    expect(formatSignedDifference(3)).toBe('+3');
    expect(formatSignedDifference(-8)).toBe('−8');
    expect(formatSignedDifference(0)).toBe('0');
  });
});

describe('describeHealthStatDays', () => {
  test('ticks step days that reach the goal', () => {
    const snapshots = new Map([
      ['2026-10-03', snapshotFor('2026-10-03', { steps: 7837 })],
      ['2026-10-02', snapshotFor('2026-10-02', { steps: 4610 })],
    ]);
    const statDays = describeHealthStatDays('steps', ['2026-10-03', '2026-10-02'], snapshots, 5000);
    expect(statDays[0].valueText).toBe('7,837');
    expect(statDays[0].detail?.text).toBe('✓');
    expect(statDays[1].detail).toBeNull();
  });

  test('flags short nights', () => {
    const snapshots = new Map([['2026-10-03', snapshotFor('2026-10-03', { sleepMinutes: 300 })]]);
    const [statDay] = describeHealthStatDays('sleep', ['2026-10-03'], snapshots, 5000);
    expect(statDay.valueTone).toBe('attention');
    expect(statDay.detail?.text).toBe('Short');
  });

  test('shows resting heart rate against the period average', () => {
    const snapshots = new Map([
      ['2026-10-03', snapshotFor('2026-10-03', { restingHeartRate: 60 })],
      ['2026-10-02', snapshotFor('2026-10-02', { restingHeartRate: 50 })],
      ['2026-10-01', snapshotFor('2026-10-01', { restingHeartRate: 55 })],
    ]);
    const statDays = describeHealthStatDays(
      'restingHeartRate',
      ['2026-10-04', '2026-10-03', '2026-10-02', '2026-10-01'],
      snapshots,
      5000,
    );
    expect(statDays[0].valueText).toBe('—');
    expect(statDays[0].detail).toBeNull();
    expect(statDays[1].detail).toMatchObject({ text: '+5', tone: 'attention' });
    expect(statDays[2].detail).toMatchObject({ text: '−5', tone: 'positive' });
    expect(statDays[3].detail).toMatchObject({ text: '0' });
  });
});

describe('describeStreakStatDays', () => {
  const completed = { status: 'completed', planEntryId: 1 } as ScheduledWorkout;
  const planned = { status: 'planned', planEntryId: 2 } as ScheduledWorkout;

  test('shows completed and planned workouts per day', () => {
    const scheduledWorkoutsByDate = new Map([
      ['2026-10-05', [completed, planned]],
      ['2026-10-06', [planned]],
    ]);
    const statDays = describeStreakStatDays(['2026-10-06', '2026-10-05', '2026-10-04'], scheduledWorkoutsByDate, '2026-10-06');
    expect(statDays[0].valueText).toBe('0 / 1');
    expect(statDays[0].workoutDots.map((dot) => dot.state)).toEqual(['pending']);
    expect(statDays[1].valueText).toBe('1 / 2');
    expect(statDays[1].workoutDots.map((dot) => dot.state)).toEqual(['completed', 'missed']);
    expect(statDays[2].valueText).toBe('Rest');
  });

  test('shows a dash while workouts are loading', () => {
    const [statDay] = describeStreakStatDays(['2026-10-06'], null, '2026-10-06');
    expect(statDay.valueText).toBe('—');
  });
});
