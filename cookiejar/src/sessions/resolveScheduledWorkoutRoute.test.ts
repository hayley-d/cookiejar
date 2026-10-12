import { describe, expect, test } from 'bun:test';

import { resolveScheduledWorkoutRoute } from '@/sessions/resolveScheduledWorkoutRoute';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

function scheduledWorkout(
  status: 'planned' | 'inProgress' | 'completed',
  overrides: Partial<ScheduledWorkout> = {},
): ScheduledWorkout {
  return {
    date: '2026-10-05',
    timeOfDay: '14:30',
    planEntryId: 1,
    workout: {
      id: 1,
      name: 'Push Day',
      kind: 'individual',
      classType: null,
      activityType: null,
      durationMinutes: 45,
      imageUrl: null,
      exerciseCount: 4,
      targetSetCount: 12,
      targetRestSeconds: 540,
    },
    status,
    sessionId: status === 'planned' ? null : 100,
    ...overrides,
  };
}

describe('resolveScheduledWorkoutRoute', () => {
  test('completed card opens the summary', () => {
    const result = resolveScheduledWorkoutRoute(scheduledWorkout('completed'));
    expect(result).toEqual({
      pathname: '/sessions/[sessionId]/summary',
      params: { sessionId: '100' },
    });
  });

  test('completed card works when workout was deleted', () => {
    const result = resolveScheduledWorkoutRoute(
      scheduledWorkout('completed', { workout: { ...scheduledWorkout('completed').workout, id: null } }),
    );
    expect(result).toEqual({
      pathname: '/sessions/[sessionId]/summary',
      params: { sessionId: '100' },
    });
  });

  test('in-progress card opens the logger', () => {
    const result = resolveScheduledWorkoutRoute(scheduledWorkout('inProgress'));
    expect(result).toEqual({
      pathname: '/sessions/[sessionId]',
      params: { sessionId: '100' },
    });
  });

  test('in-progress card works when workout was deleted', () => {
    const result = resolveScheduledWorkoutRoute(
      scheduledWorkout('inProgress', { workout: { ...scheduledWorkout('inProgress').workout, id: null } }),
    );
    expect(result).toEqual({
      pathname: '/sessions/[sessionId]',
      params: { sessionId: '100' },
    });
  });

  test('planned card opens the detail when workout id is set', () => {
    const result = resolveScheduledWorkoutRoute(scheduledWorkout('planned'));
    expect(result).toEqual({
      pathname: '/workout/[workoutId]',
      params: {
        workoutId: '1',
        date: '2026-10-05',
        planEntryId: '1',
      },
    });
  });

  test('planned card opens the detail without planEntryId when it is null', () => {
    const result = resolveScheduledWorkoutRoute(scheduledWorkout('planned', { planEntryId: null }));
    expect(result).toEqual({
      pathname: '/workout/[workoutId]',
      params: {
        workoutId: '1',
        date: '2026-10-05',
      },
    });
  });

  test('planned activity opens the log form with its date, workout and plan entry', () => {
    const planned = scheduledWorkout('planned');
    const result = resolveScheduledWorkoutRoute(
      scheduledWorkout('planned', { workout: { ...planned.workout, kind: 'activity', activityType: 'hike' } }),
    );
    expect(result).toEqual({
      pathname: '/activities/log',
      params: { workoutId: '1', date: '2026-10-05', planEntryId: '1' },
    });
  });

  test('planned activity without a plan entry omits planEntryId', () => {
    const planned = scheduledWorkout('planned');
    const result = resolveScheduledWorkoutRoute(
      scheduledWorkout('planned', {
        planEntryId: null,
        workout: { ...planned.workout, kind: 'activity', activityType: 'run' },
      }),
    );
    expect(result).toEqual({
      pathname: '/activities/log',
      params: { workoutId: '1', date: '2026-10-05' },
    });
  });

  test('planned activity returns null when workout id is null', () => {
    const planned = scheduledWorkout('planned');
    const result = resolveScheduledWorkoutRoute(
      scheduledWorkout('planned', { workout: { ...planned.workout, id: null, kind: 'activity', activityType: 'walk' } }),
    );
    expect(result).toBeNull();
  });

  test('completed activity opens the summary', () => {
    const completed = scheduledWorkout('completed');
    const result = resolveScheduledWorkoutRoute(
      scheduledWorkout('completed', { workout: { ...completed.workout, kind: 'activity', activityType: 'hike' } }),
    );
    expect(result).toEqual({
      pathname: '/sessions/[sessionId]/summary',
      params: { sessionId: '100' },
    });
  });

  test('planned swim opens the swim workout with its date and plan entry', () => {
    const planned = scheduledWorkout('planned');
    const result = resolveScheduledWorkoutRoute(
      scheduledWorkout('planned', { workout: { ...planned.workout, kind: 'swim' } }),
    );
    expect(result).toEqual({
      pathname: '/workout/[workoutId]',
      params: { workoutId: '1', date: '2026-10-05', planEntryId: '1' },
    });
  });

  test('in-progress swim opens the logger and completed swim opens the summary', () => {
    const inProgress = scheduledWorkout('inProgress');
    const completed = scheduledWorkout('completed');
    expect(
      resolveScheduledWorkoutRoute(
        scheduledWorkout('inProgress', { workout: { ...inProgress.workout, kind: 'swim' } }),
      ),
    ).toEqual({ pathname: '/sessions/[sessionId]', params: { sessionId: '100' } });
    expect(
      resolveScheduledWorkoutRoute(scheduledWorkout('completed', { workout: { ...completed.workout, kind: 'swim' } })),
    ).toEqual({ pathname: '/sessions/[sessionId]/summary', params: { sessionId: '100' } });
  });

  test('planned card returns null when workout id is null', () => {
    const result = resolveScheduledWorkoutRoute(
      scheduledWorkout('planned', { workout: { ...scheduledWorkout('planned').workout, id: null } }),
    );
    expect(result).toBeNull();
  });

  test('completed card with no sessionId returns null', () => {
    const result = resolveScheduledWorkoutRoute(scheduledWorkout('completed', { sessionId: null }));
    expect(result).toBeNull();
  });

  test('in-progress card with no sessionId returns null', () => {
    const result = resolveScheduledWorkoutRoute(scheduledWorkout('inProgress', { sessionId: null }));
    expect(result).toBeNull();
  });
});
