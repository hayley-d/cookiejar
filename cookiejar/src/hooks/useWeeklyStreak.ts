import { useMemo } from 'react';

import { addDays } from '@/dates/addDays';
import { startOfWeek } from '@/dates/startOfWeek';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { useProfile } from '@/hooks/useProfile';
import { useScheduledWorkouts } from '@/hooks/useScheduledWorkouts';
import { calculateWeeklyStreak, isWeeklyTargetMet, type WeeklyStreak } from '@/progress/calculateWeeklyStreak';

const daysPerWeek = 7;

export type WeeklyStreakLookup =
  { status: 'loading' } | { status: 'failed' } | { status: 'ready'; streak: WeeklyStreak; isTargetMet: boolean };

export function useWeeklyStreak(now: Date): WeeklyStreakLookup {
  const today = toLocalDateString(now);
  const mondayDate = toLocalDateString(startOfWeek(now));
  const { weeklyWorkoutTarget } = useProfile();

  const weekDates = useMemo(() => {
    const [year, month, day] = mondayDate.split('-').map(Number);
    const monday = new Date(year, month - 1, day);
    return Array.from({ length: daysPerWeek }, (_, offset) => toLocalDateString(addDays(monday, offset)));
  }, [mondayDate]);

  const scheduledWorkoutsLookup = useScheduledWorkouts(weekDates[0], weekDates[daysPerWeek - 1]);

  return useMemo<WeeklyStreakLookup>(() => {
    if (scheduledWorkoutsLookup.status !== 'ready') {
      return { status: scheduledWorkoutsLookup.status };
    }
    const streak = calculateWeeklyStreak({
      today,
      weekDates,
      scheduledWorkoutsByDate: scheduledWorkoutsLookup.scheduledWorkoutsByDate,
    });
    return { status: 'ready', streak, isTargetMet: isWeeklyTargetMet(streak, weeklyWorkoutTarget) };
  }, [scheduledWorkoutsLookup, today, weekDates, weeklyWorkoutTarget]);
}
