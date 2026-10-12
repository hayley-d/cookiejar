import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { activityHealthActivityCodes } from '@/activities/activityMetricsFromHealthWorkout';
import type { HealthWorkout } from '@/health/HealthTypes';
import { findOverlappingWorkouts } from '@/health/readHealthWorkouts';

export async function readDayActivityWorkouts(date: string): Promise<HealthWorkout[]> {
  const startDate = parseLocalDateString(date);
  const workouts = await findOverlappingWorkouts(startDate, addDays(startDate, 1));
  return workouts
    .filter((workout) => activityHealthActivityCodes.includes(workout.activityTypeCode))
    .filter((workout) => workout.startDate.getTime() >= startDate.getTime())
    .sort((first, second) => first.startDate.getTime() - second.startDate.getTime());
}
