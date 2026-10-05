import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import type { Insight } from '@/coach/Insight';
import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { calculateWeeklyStreak, isWeeklyTargetMet } from '@/progress/calculateWeeklyStreak';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

export const streakMilestonePriority = 50;
export const minimumStreakWeekCount = 3;
export const previousWeekCount = 4;

const daysPerWeek = 7;

function isTargetMetInWeek(
  snapshot: CoachSnapshot,
  weekStartDate: string,
  scheduledWorkouts: readonly ScheduledWorkout[],
  weeklyWorkoutTarget: number,
): boolean {
  const weekStart = parseLocalDateString(weekStartDate);
  const weekDates = Array.from({ length: daysPerWeek }, (_, dayOffset) =>
    toLocalDateString(addDays(weekStart, dayOffset)),
  );
  const scheduledWorkoutsByDate = new Map<string, ScheduledWorkout[]>();
  for (const scheduledWorkout of scheduledWorkouts) {
    scheduledWorkoutsByDate.set(scheduledWorkout.date, [
      ...(scheduledWorkoutsByDate.get(scheduledWorkout.date) ?? []),
      scheduledWorkout,
    ]);
  }
  const weeklyStreak = calculateWeeklyStreak({
    today: snapshot.today,
    weekDates,
    scheduledWorkoutsByDate,
  });
  return isWeeklyTargetMet(weeklyStreak, weeklyWorkoutTarget);
}

function countPreviousMetWeeks(snapshot: CoachSnapshot, weeklyWorkoutTarget: number): number {
  const currentWeekStart = parseLocalDateString(snapshot.weekStartDate);
  let metWeekCount = 0;
  for (let weeksBack = 1; weeksBack <= previousWeekCount; weeksBack += 1) {
    const weekStartDate = toLocalDateString(addDays(currentWeekStart, -weeksBack * daysPerWeek));
    const weekEndDate = toLocalDateString(addDays(parseLocalDateString(weekStartDate), daysPerWeek - 1));
    const weekWorkouts = snapshot.scheduledPreviousFourWeeks.filter(
      (scheduledWorkout) => scheduledWorkout.date >= weekStartDate && scheduledWorkout.date <= weekEndDate,
    );
    if (!isTargetMetInWeek(snapshot, weekStartDate, weekWorkouts, weeklyWorkoutTarget)) {
      break;
    }
    metWeekCount += 1;
  }
  return metWeekCount;
}

export function streakMilestone(snapshot: CoachSnapshot): Insight[] {
  if (snapshot.profile === null) {
    return [];
  }
  const weeklyWorkoutTarget = snapshot.profile.weeklyWorkoutTarget;
  const isThisWeekMet = isTargetMetInWeek(
    snapshot,
    snapshot.weekStartDate,
    snapshot.scheduledThisWeek,
    weeklyWorkoutTarget,
  );
  const previousMetWeekCount = countPreviousMetWeeks(snapshot, weeklyWorkoutTarget);
  const streakWeekCount = previousMetWeekCount + (isThisWeekMet ? 1 : 0);
  if (!isThisWeekMet && previousMetWeekCount < minimumStreakWeekCount) {
    return [];
  }
  const message =
    streakWeekCount >= minimumStreakWeekCount
      ? `${streakWeekCount} weeks in a row hitting your target! 🔥`
      : 'You hit your weekly target this week! 🔥';
  return [
    {
      ruleIdentifier: 'streakMilestone',
      topics: ['progress', 'week'],
      priority: streakMilestonePriority,
      nuggie: 'goodJob',
      messages: [message],
      action: null,
    },
  ];
}
