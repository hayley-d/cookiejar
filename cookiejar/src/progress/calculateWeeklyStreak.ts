import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

export type WeeklyStreakDayState = 'completed' | 'pending' | 'missed' | 'unplanned' | 'rest';

export type WeeklyStreakDay = {
  date: string;
  state: WeeklyStreakDayState;
};

export type WeeklyStreak = {
  completedCount: number;
  plannedCount: number;
  days: WeeklyStreakDay[];
};

type WeeklyStreakInput = {
  today: string;
  weekDates: readonly string[];
  scheduledWorkoutsByDate: ReadonlyMap<string, readonly ScheduledWorkout[]>;
};

function isPlanned(scheduledWorkout: ScheduledWorkout): boolean {
  return scheduledWorkout.planEntryId !== null;
}

function isCompleted(scheduledWorkout: ScheduledWorkout): boolean {
  return scheduledWorkout.status === 'completed';
}

function dayState(date: string, today: string, scheduledWorkouts: readonly ScheduledWorkout[]): WeeklyStreakDayState {
  if (scheduledWorkouts.length === 0) {
    return 'rest';
  }
  const isPast = date < today;
  const hasUnfinishedPlannedWorkout = scheduledWorkouts.some(
    (scheduledWorkout) => isPlanned(scheduledWorkout) && !isCompleted(scheduledWorkout),
  );
  if (hasUnfinishedPlannedWorkout) {
    return isPast ? 'missed' : 'pending';
  }
  if (scheduledWorkouts.some(isCompleted)) {
    return scheduledWorkouts.some((scheduledWorkout) => isPlanned(scheduledWorkout) && isCompleted(scheduledWorkout))
      ? 'completed'
      : 'unplanned';
  }
  return isPast ? 'rest' : 'pending';
}

export function countScheduledWorkouts(scheduledWorkouts: readonly ScheduledWorkout[]) {
  let completedCount = 0;
  let plannedCount = 0;
  for (const scheduledWorkout of scheduledWorkouts) {
    if (isCompleted(scheduledWorkout)) {
      completedCount += 1;
      plannedCount += 1;
    } else if (isPlanned(scheduledWorkout)) {
      plannedCount += 1;
    }
  }
  return { completedCount, plannedCount };
}

export function calculateWeeklyStreak({ today, weekDates, scheduledWorkoutsByDate }: WeeklyStreakInput): WeeklyStreak {
  let completedCount = 0;
  let plannedCount = 0;
  const days = weekDates.map((date) => {
    const scheduledWorkouts = scheduledWorkoutsByDate.get(date) ?? [];
    const dayCounts = countScheduledWorkouts(scheduledWorkouts);
    completedCount += dayCounts.completedCount;
    plannedCount += dayCounts.plannedCount;
    return { date, state: dayState(date, today, scheduledWorkouts) };
  });
  return { completedCount, plannedCount, days };
}

export function isWeeklyTargetMet(
  { completedCount, plannedCount }: Pick<WeeklyStreak, 'completedCount' | 'plannedCount'>,
  weeklyWorkoutTarget: number,
): boolean {
  return completedCount >= weeklyWorkoutTarget || (plannedCount > 0 && completedCount >= plannedCount);
}
