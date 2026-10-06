import type { SQLiteDatabase } from 'expo-sqlite';

import {
  deleteFutureNotificationsWithIdentifierPrefix,
  upsertNotification,
} from '@/database/repositories/notificationRepository';
import { getActivePlanWithEntries } from '@/database/repositories/planRepository';
import { listSessionsBetween } from '@/database/repositories/scheduleRepository';
import { loadNotificationSettings } from '@/hooks/loadNotificationSettings';
import { buildWorkoutReminders } from '@/notifications/buildWorkoutReminders';
import { workoutReminderIdentifierPrefix } from '@/notifications/notificationIdentifiers';
import { getNotificationPermissionStatus } from '@/notifications/notificationPermission';
import {
  cancelPendingNotificationsWithIdentifierPrefix,
  schedulePlannedNotification,
} from '@/notifications/notificationScheduling';
import type { NotificationSettings } from '@/notifications/NotificationSettings';
import type { PlannedNotification } from '@/notifications/PlannedNotification';
import { reportNotificationError } from '@/notifications/reportNotificationError';
import { workoutReminderWindow } from '@/notifications/workoutReminderWindow';
import { buildScheduledWorkouts } from '@/plans/buildScheduledWorkouts';

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

export async function reconcileNotifications(database: SQLiteDatabase): Promise<void> {
  const settings = await loadNotificationSettings(database);
  const permissionStatus = await getNotificationPermissionStatus();
  const now = new Date();
  const context: ReconcileContext = { database, settings, canSchedule: permissionStatus === 'granted', now };

  const workoutReminders = await planWorkoutReminders(context);
  await replacePlannedNotifications(context, workoutReminderIdentifierPrefix, workoutReminders);
}
