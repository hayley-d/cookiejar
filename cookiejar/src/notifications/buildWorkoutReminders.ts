import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { notificationsConfiguration } from '@/notifications/notificationsConfiguration';
import { workoutReminderIdentifier } from '@/notifications/notificationIdentifiers';
import type { NotificationSettings } from '@/notifications/NotificationSettings';
import type { PlannedNotification } from '@/notifications/PlannedNotification';
import { routeToHref } from '@/notifications/routeToHref';
import { workoutReminderWindow } from '@/notifications/workoutReminderWindow';
import { formatTimeOfDay, timeOfDayToDate } from '@/plans/timeOfDay';
import { resolveScheduledWorkoutRoute } from '@/sessions/resolveScheduledWorkoutRoute';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

const millisecondsPerMinute = 60_000;

function buildWorkoutReminder(
  scheduledWorkout: ScheduledWorkout,
  reminderLeadMinutes: number,
  now: Date,
): PlannedNotification | null {
  const { timeOfDay, planEntryId } = scheduledWorkout;
  if (scheduledWorkout.status !== 'planned' || timeOfDay === null || planEntryId === null) {
    return null;
  }
  const route = resolveScheduledWorkoutRoute(scheduledWorkout);
  if (route === null) {
    return null;
  }
  const workoutStartsAt = timeOfDayToDate(timeOfDay, parseLocalDateString(scheduledWorkout.date));
  const fireAt = new Date(workoutStartsAt.getTime() - reminderLeadMinutes * millisecondsPerMinute);
  if (fireAt.getTime() <= now.getTime()) {
    return null;
  }
  return {
    identifier: workoutReminderIdentifier(scheduledWorkout.date, planEntryId),
    title: notificationsConfiguration.workoutReminderTitle,
    body: `${scheduledWorkout.workout.name} at ${formatTimeOfDay(timeOfDay)} — Nuggie's ready when you are!`,
    nuggie: 'notification',
    route: routeToHref(route),
    fireAt,
    playsSound: true,
  };
}

export function buildWorkoutReminders(
  scheduledWorkoutsByDate: ReadonlyMap<string, readonly ScheduledWorkout[]>,
  settings: NotificationSettings,
  now: Date,
): PlannedNotification[] {
  if (!settings.areWorkoutRemindersEnabled) {
    return [];
  }
  const { startDate, endDate } = workoutReminderWindow(now);
  const reminders: PlannedNotification[] = [];
  for (const [date, scheduledWorkouts] of scheduledWorkoutsByDate) {
    if (date < startDate || date > endDate) {
      continue;
    }
    for (const scheduledWorkout of scheduledWorkouts) {
      const reminder = buildWorkoutReminder(scheduledWorkout, settings.reminderLeadMinutes, now);
      if (reminder !== null) {
        reminders.push(reminder);
      }
    }
  }
  return reminders.sort((first, second) => first.fireAt.getTime() - second.fireAt.getTime());
}
