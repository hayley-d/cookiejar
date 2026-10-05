import { useMemo } from 'react';

import { addDays } from '@/dates/addDays';
import { startOfWeek } from '@/dates/startOfWeek';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { useScheduledWorkouts } from '@/hooks/useScheduledWorkouts';
import { calculateWeeklyStreak, isWeeklyTargetMet, type WeeklyStreak } from '@/progress/calculateWeeklyStreak';

const daysPerWeek = 7;

export type WeeklyStreakLookup =
  { status: 'loading' } | { status: 'failed' } | { status: 'ready'; streak: WeeklyStreak; isTargetMet: boolean };

export function useWeeklyStreak(now: Date, weeklyWorkoutTarget: number): WeeklyStreakLookup {
  const today = toLocalDateString(now);
  const mondayDate = toLocalDateString(startOfWeek(now));

  const weekDates = useMemo(() => {
    const [year, month, day] = mondayDate.split('-').map(Number);
    const monday = new Date(year, month - 1, day);
    return Array.from({ length: daysPerWeek }, (_, offset) => toLocalDateString(addDays(monday, offset)));
  }, [mondayDate]);

  const scheduledWorkoutsLookup = useScheduledWorkouts(weekDates[0], weekDates[daysPerWeek - 1]);

  const status = scheduledWorkoutsLookup.status;
  const scheduledWorkoutsByDate =
    scheduledWorkoutsLookup.status === 'ready' ? scheduledWorkoutsLookup.scheduledWorkoutsByDate : null;

  return useMemo<WeeklyStreakLookup>(() => {
    if (scheduledWorkoutsByDate === null) {
      return { status: status === 'failed' ? 'failed' : 'loading' };
    }
    const streak = calculateWeeklyStreak({ today, weekDates, scheduledWorkoutsByDate });
    return { status: 'ready', streak, isTargetMet: isWeeklyTargetMet(streak, weeklyWorkoutTarget) };
  }, [status, scheduledWorkoutsByDate, today, weekDates, weeklyWorkoutTarget]);
}
