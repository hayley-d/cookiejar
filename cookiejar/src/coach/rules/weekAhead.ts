import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import type { Insight } from '@/coach/Insight';
import { addDays } from '@/dates/addDays';
import { weekdayNamesFromSunday } from '@/dates/calendarNames';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { countScheduledWorkouts } from '@/progress/calculateWeeklyStreak';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

export const weekAheadPriority = 10;

function toTimeOfDay(now: Date): string {
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function isStillAhead(scheduledWorkout: ScheduledWorkout, today: string, currentTimeOfDay: string): boolean {
  if (scheduledWorkout.status !== 'planned') {
    return false;
  }
  if (scheduledWorkout.date !== today) {
    return scheduledWorkout.date > today;
  }
  return scheduledWorkout.timeOfDay === null || scheduledWorkout.timeOfDay >= currentTimeOfDay;
}

function describeDay(date: string, now: Date): string {
  if (date === toLocalDateString(now)) {
    return 'today';
  }
  if (date === toLocalDateString(addDays(now, 1))) {
    return 'tomorrow';
  }
  return `on ${weekdayNamesFromSunday[parseLocalDateString(date).getDay()]}`;
}

function describeWorkoutCount(count: number): string {
  return count === 1 ? '1 workout' : `${count} workouts`;
}

function describeNextWorkout(scheduledWorkout: ScheduledWorkout | undefined, now: Date): string {
  if (scheduledWorkout === undefined) {
    return 'Nothing else planned this week.';
  }
  const timeText = scheduledWorkout.timeOfDay === null ? '' : ` at ${scheduledWorkout.timeOfDay}`;
  return `Next: ${scheduledWorkout.workout.name} ${describeDay(scheduledWorkout.date, now)}${timeText}.`;
}

export function weekAhead(snapshot: CoachSnapshot): Insight[] {
  const { completedCount, plannedCount } = countScheduledWorkouts(snapshot.scheduledThisWeek);
  const currentTimeOfDay = toTimeOfDay(snapshot.now);
  const nextWorkout = snapshot.scheduledThisWeek.find((scheduledWorkout) =>
    isStillAhead(scheduledWorkout, snapshot.today, currentTimeOfDay),
  );
  const messages =
    plannedCount === 0
      ? ['Nothing planned this week yet.', "Pick a plan and I'll keep you on track!"]
      : [
          `This week: ${describeWorkoutCount(plannedCount)} planned, ${completedCount} done.`,
          describeNextWorkout(nextWorkout, snapshot.now),
        ];
  return [
    {
      ruleIdentifier: 'weekAhead',
      topics: ['week'],
      priority: weekAheadPriority,
      nuggie: 'workout',
      messages,
      action: { label: 'Open calendar', destination: { screen: 'calendar' } },
    },
  ];
}
