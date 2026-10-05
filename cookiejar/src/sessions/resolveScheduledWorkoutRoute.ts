import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

export type ScheduledWorkoutRoute =
  | { pathname: '/workout/[workoutId]'; params: { workoutId: string; date: string; planEntryId?: string } }
  | { pathname: '/sessions/[sessionId]'; params: { sessionId: string } }
  | { pathname: '/sessions/[sessionId]/summary'; params: { sessionId: string } }
  | null;

export function resolveScheduledWorkoutRoute(scheduledWorkout: ScheduledWorkout): ScheduledWorkoutRoute {
  if (scheduledWorkout.status === 'completed' && scheduledWorkout.sessionId !== null) {
    return {
      pathname: '/sessions/[sessionId]/summary',
      params: {
        sessionId: String(scheduledWorkout.sessionId),
      },
    };
  }

  if (scheduledWorkout.status === 'inProgress' && scheduledWorkout.sessionId !== null) {
    return {
      pathname: '/sessions/[sessionId]',
      params: {
        sessionId: String(scheduledWorkout.sessionId),
      },
    };
  }

  if (scheduledWorkout.status === 'planned') {
    const workoutId = scheduledWorkout.workout.id;
    if (workoutId === null) {
      return null;
    }
    return {
      pathname: '/workout/[workoutId]',
      params: {
        workoutId: String(workoutId),
        date: scheduledWorkout.date,
        ...(scheduledWorkout.planEntryId === null ? {} : { planEntryId: String(scheduledWorkout.planEntryId) }),
      },
    };
  }

  return null;
}
