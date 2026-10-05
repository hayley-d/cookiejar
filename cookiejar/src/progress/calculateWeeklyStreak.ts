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
  const hasUnfinishedPlannedWorkout = scheduledWorkouts.some(
    (scheduledWorkout) => isPlanned(scheduledWorkout) && !isCompleted(scheduledWorkout),
  );
  if (scheduledWorkouts.every(isCompleted)) {
    return scheduledWorkouts.some(isPlanned) ? 'completed' : 'unplanned';
  }
  if (date < today) {
    return hasUnfinishedPlannedWorkout ? 'missed' : 'rest';
  }
  return 'pending';
}

export function calculateWeeklyStreak({ today, weekDates, scheduledWorkoutsByDate }: WeeklyStreakInput): WeeklyStreak {
  let completedCount = 0;
  let plannedCount = 0;
  const days = weekDates.map((date) => {
    const scheduledWorkouts = scheduledWorkoutsByDate.get(date) ?? [];
    for (const scheduledWorkout of scheduledWorkouts) {
      if (isCompleted(scheduledWorkout)) {
        completedCount += 1;
        plannedCount += 1;
      } else if (isPlanned(scheduledWorkout)) {
        plannedCount += 1;
      }
    }
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
