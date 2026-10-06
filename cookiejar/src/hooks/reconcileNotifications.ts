import type { SQLiteDatabase } from 'expo-sqlite';

import {
  deleteFutureNotificationsWithIdentifierPrefix,
  upsertNotification,
} from '@/database/repositories/notificationRepository';
import { getActivePlanWithEntries } from '@/database/repositories/planRepository';
import { listAllFinishedSessionSets } from '@/database/repositories/progressRepository';
import { listSessionsBetween } from '@/database/repositories/scheduleRepository';
import { loadNotificationSettings } from '@/hooks/loadNotificationSettings';
import { buildWeeklySummary } from '@/notifications/buildWeeklySummary';
import { buildWorkoutReminders } from '@/notifications/buildWorkoutReminders';
import {
  weeklySummaryIdentifierPrefix,
  workoutReminderIdentifierPrefix,
} from '@/notifications/notificationIdentifiers';
import { nextSundayAtSeven } from '@/notifications/nextSundayAtSeven';
import { getNotificationPermissionStatus } from '@/notifications/notificationPermission';
import {
  cancelPendingNotificationsWithIdentifierPrefix,
  schedulePlannedNotification,
} from '@/notifications/notificationScheduling';
import type { NotificationSettings } from '@/notifications/NotificationSettings';
import type { PlannedNotification } from '@/notifications/PlannedNotification';
import { reportNotificationError } from '@/notifications/reportNotificationError';
import { summaryWeekDates } from '@/notifications/summaryWeekDates';
import { workoutReminderWindow } from '@/notifications/workoutReminderWindow';
import { buildScheduledWorkouts } from '@/plans/buildScheduledWorkouts';
import { buildPersonalRecordList, countPersonalRecordsInRange } from '@/progress/buildPersonalRecordList';
import { calculateWeeklyStreak } from '@/progress/calculateWeeklyStreak';

type ReconcileContext = {
  database: SQLiteDatabase;
  settings: NotificationSettings;
  canSchedule: boolean;
  now: Date;
};

async function replacePlannedNotifications(
  context: ReconcileContext,
  identifierPrefix: string,
  plannedNotifications: readonly PlannedNotification[],
): Promise<void> {
  await cancelPendingNotificationsWithIdentifierPrefix(identifierPrefix);
  await deleteFutureNotificationsWithIdentifierPrefix(context.database, identifierPrefix, context.now);
  if (!context.canSchedule) {
    return;
  }
  for (const plannedNotification of plannedNotifications) {
    try {
      await schedulePlannedNotification(plannedNotification);
      await upsertNotification(context.database, {
        identifier: plannedNotification.identifier,
        title: plannedNotification.title,
        body: plannedNotification.body,
        nuggie: plannedNotification.nuggie,
        route: plannedNotification.route,
        createdAt: plannedNotification.fireAt.toISOString(),
      });
    } catch (error) {
      reportNotificationError(error);
    }
  }
}

async function planWorkoutReminders(context: ReconcileContext): Promise<PlannedNotification[]> {
  if (!context.canSchedule || !context.settings.areWorkoutRemindersEnabled) {
    return [];
  }
  const { startDate, endDate } = workoutReminderWindow(context.now);
  const [activePlan, sessions] = await Promise.all([
    getActivePlanWithEntries(context.database),
    listSessionsBetween(context.database, startDate, endDate),
  ]);
  const scheduledWorkoutsByDate = buildScheduledWorkouts({ startDate, endDate, activePlan, sessions });
  return buildWorkoutReminders(scheduledWorkoutsByDate, context.settings, context.now);
}

async function planWeeklySummary(context: ReconcileContext): Promise<PlannedNotification[]> {
  if (!context.canSchedule || !context.settings.isWeeklySummaryEnabled) {
    return [];
  }
  const summaryFireAt = nextSundayAtSeven(context.now);
  const weekDates = summaryWeekDates(summaryFireAt);
  const startDate = weekDates[0];
  const endDate = weekDates[weekDates.length - 1];
  const [activePlan, sessions, finishedSessionSets] = await Promise.all([
    getActivePlanWithEntries(context.database),
    listSessionsBetween(context.database, startDate, endDate),
    listAllFinishedSessionSets(context.database),
  ]);
  const scheduledWorkoutsByDate = buildScheduledWorkouts({ startDate, endDate, activePlan, sessions });
  const { completedCount, plannedCount } = calculateWeeklyStreak({
    today: endDate,
    weekDates,
    scheduledWorkoutsByDate,
  });
  const recordCount = countPersonalRecordsInRange(buildPersonalRecordList(finishedSessionSets), { startDate, endDate });
  return [buildWeeklySummary({ completedCount, plannedCount, recordCount, now: context.now })];
}

async function reconcileKind(
  context: ReconcileContext,
  identifierPrefix: string,
  planKind: (context: ReconcileContext) => Promise<PlannedNotification[]>,
): Promise<void> {
  try {
    const plannedNotifications = await planKind(context);
    await replacePlannedNotifications(context, identifierPrefix, plannedNotifications);
  } catch (error) {
    reportNotificationError(error);
  }
}

export async function reconcileNotifications(database: SQLiteDatabase): Promise<void> {
  const settings = await loadNotificationSettings(database);
  const permissionStatus = await getNotificationPermissionStatus();
  const now = new Date();
  const context: ReconcileContext = { database, settings, canSchedule: permissionStatus === 'granted', now };

  await reconcileKind(context, workoutReminderIdentifierPrefix, planWorkoutReminders);
  await reconcileKind(context, weeklySummaryIdentifierPrefix, planWeeklySummary);
}
