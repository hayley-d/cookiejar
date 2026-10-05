import type { CoachSnapshot } from '@/coach/CoachSnapshot';

export type TodaysTraining = { kind: 'upcoming'; workoutName: string } | { kind: 'trainedAlready' } | { kind: 'restDay' };

export function todaysTraining(snapshot: CoachSnapshot): TodaysTraining {
  const scheduledToday = snapshot.scheduledThisWeek.filter((scheduledWorkout) => scheduledWorkout.date === snapshot.today);
  const upcoming = scheduledToday.find((scheduledWorkout) => scheduledWorkout.status !== 'completed');
  if (upcoming !== undefined) {
    return { kind: 'upcoming', workoutName: upcoming.workout.name };
  }
  return scheduledToday.length > 0 ? { kind: 'trainedAlready' } : { kind: 'restDay' };
}
