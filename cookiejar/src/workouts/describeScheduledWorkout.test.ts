import { describe, expect, test } from 'bun:test';

import type { ScheduledWorkout, ScheduledWorkoutSummary } from '@/types/ScheduledWorkout';
import { describeScheduledWorkoutKind, describeScheduledWorkoutSummary } from '@/workouts/describeScheduledWorkout';

const individualWorkout: ScheduledWorkoutSummary = {
  id: 1,
  name: 'Push Day',
  kind: 'individual',
  classType: null,
  activityType: null,
  durationMinutes: null,
  imageUrl: null,
  exerciseCount: 1,
  targetSetCount: 0,
  targetRestSeconds: 0,
};

function scheduled(workout: Partial<ScheduledWorkoutSummary>, timeOfDay: string | null = null): ScheduledWorkout {
  return {
    date: '2026-10-12',
    timeOfDay,
    planEntryId: null,
    workout: { ...individualWorkout, ...workout },
    status: 'planned',
    sessionId: null,
  };
}

describe('describeScheduledWorkoutKind', () => {
  test('an individual workout says Workout', () => {
    expect(describeScheduledWorkoutKind(scheduled({}))).toBe('Workout');
  });

  test('a class shows its class type and falls back to Class', () => {
    expect(describeScheduledWorkoutKind(scheduled({ kind: 'class', classType: 'spin' }))).toBe('Spin');
    expect(describeScheduledWorkoutKind(scheduled({ kind: 'class' }))).toBe('Class');
  });

  test('an activity shows its activity type and falls back to Activity', () => {
    expect(describeScheduledWorkoutKind(scheduled({ kind: 'activity', activityType: 'hike' }))).toBe('Hike');
    expect(describeScheduledWorkoutKind(scheduled({ kind: 'activity' }))).toBe('Activity');
  });
});

describe('describeScheduledWorkoutSummary', () => {
  test('an activity has no summary', () => {
    expect(describeScheduledWorkoutSummary(scheduled({ kind: 'activity', activityType: 'run' }))).toBeNull();
  });

  test('a class shows its duration', () => {
    expect(describeScheduledWorkoutSummary(scheduled({ kind: 'class', classType: 'yoga', durationMinutes: 45 }))).toBe(
      '45 min',
    );
  });

  test('an individual workout counts its exercises', () => {
    expect(describeScheduledWorkoutSummary(scheduled({ exerciseCount: 3 }))).toBe('3 exercises');
  });
});
