import { describe, expect, test } from 'bun:test';

import { dayMarkerState } from '@/plans/dayMarkerState';
import type { ScheduledWorkout, ScheduledWorkoutStatus } from '@/types/ScheduledWorkout';

function scheduledWorkout(status: ScheduledWorkoutStatus, planEntryId: number | null = 1): ScheduledWorkout {
  return {
    date: '2026-10-05',
    timeOfDay: null,
    planEntryId,
    workout: {
      id: 1,
      name: 'Push Day',
      kind: 'individual',
      classType: null,
      durationMinutes: null,
      imageUrl: null,
      exerciseCount: 0,
      targetSetCount: 0,
      targetRestSeconds: 0,
    },
    status,
    sessionId: status === 'planned' ? null : 1,
  };
}

const today = '2026-10-05';
const pastDate = '2026-10-03';
const futureDate = '2026-10-08';

describe('dayMarkerState', () => {
  test('is none when there are no workouts', () => {
    expect(dayMarkerState({ date: pastDate, today, scheduledWorkouts: [] })).toBe('none');
  });

  test('is completed when every workout is completed', () => {
    const scheduledWorkouts = [scheduledWorkout('completed'), scheduledWorkout('completed')];
    expect(dayMarkerState({ date: pastDate, today, scheduledWorkouts })).toBe('completed');
  });

  test('counts unplanned sessions toward completed', () => {
    const scheduledWorkouts = [scheduledWorkout('completed'), scheduledWorkout('completed', null)];
    expect(dayMarkerState({ date: pastDate, today, scheduledWorkouts })).toBe('completed');
    expect(dayMarkerState({ date: pastDate, today, scheduledWorkouts: [scheduledWorkout('completed', null)] })).toBe(
      'completed',
    );
  });

  test('is missed on a past day with a planned workout', () => {
    expect(dayMarkerState({ date: pastDate, today, scheduledWorkouts: [scheduledWorkout('planned')] })).toBe('missed');
  });

  test('is missed on a past day with a mix of completed and planned', () => {
    const scheduledWorkouts = [scheduledWorkout('completed'), scheduledWorkout('planned')];
    expect(dayMarkerState({ date: pastDate, today, scheduledWorkouts })).toBe('missed');
  });

  test('is planned on a future day', () => {
    expect(dayMarkerState({ date: futureDate, today, scheduledWorkouts: [scheduledWorkout('planned')] })).toBe(
      'planned',
    );
  });

  test('stays planned today with a planned entry', () => {
    expect(dayMarkerState({ date: today, today, scheduledWorkouts: [scheduledWorkout('planned')] })).toBe('planned');
  });

  test('stays planned today when a planned entry follows a completed one', () => {
    const scheduledWorkouts = [scheduledWorkout('completed'), scheduledWorkout('planned')];
    expect(dayMarkerState({ date: today, today, scheduledWorkouts })).toBe('planned');
  });

  test('never treats in progress as missed on a past day', () => {
    expect(dayMarkerState({ date: pastDate, today, scheduledWorkouts: [scheduledWorkout('inProgress')] })).toBe(
      'planned',
    );
  });

  test('checks completed before missed', () => {
    expect(dayMarkerState({ date: pastDate, today, scheduledWorkouts: [scheduledWorkout('completed')] })).toBe(
      'completed',
    );
  });

  test('checks missed before planned when in progress sits beside a planned entry', () => {
    const scheduledWorkouts = [scheduledWorkout('inProgress'), scheduledWorkout('planned')];
    expect(dayMarkerState({ date: pastDate, today, scheduledWorkouts })).toBe('missed');
  });

  test('is planned on a future day with a completed and a planned entry', () => {
    const scheduledWorkouts = [scheduledWorkout('completed'), scheduledWorkout('planned')];
    expect(dayMarkerState({ date: futureDate, today, scheduledWorkouts })).toBe('planned');
  });
});
