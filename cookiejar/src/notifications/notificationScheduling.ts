import {
  cancelScheduledNotificationAsync,
  getAllScheduledNotificationsAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
} from 'expo-notifications';

import { restTimerIdentifier } from '@/notifications/notificationIdentifiers';
import { notificationsConfiguration } from '@/notifications/notificationsConfiguration';
import type { PlannedNotification } from '@/notifications/PlannedNotification';

export async function schedulePlannedNotification(plannedNotification: PlannedNotification): Promise<void> {
  await scheduleNotificationAsync({
    identifier: plannedNotification.identifier,
    content: {
      title: plannedNotification.title,
      body: plannedNotification.body,
      sound: plannedNotification.playsSound,
      data: { route: plannedNotification.route },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: plannedNotification.fireAt,
    },
  });
}

export async function cancelPendingNotificationsWithIdentifierPrefix(identifierPrefix: string): Promise<void> {
  const pendingRequests = await getAllScheduledNotificationsAsync();
  const matchingIdentifiers = pendingRequests
    .map((pendingRequest) => pendingRequest.identifier)
    .filter((identifier) => identifier.startsWith(identifierPrefix));
  await Promise.all(matchingIdentifiers.map((identifier) => cancelScheduledNotificationAsync(identifier)));
}

export async function scheduleRestTimerNotification(seconds: number, sessionRoute: string | null): Promise<void> {
  await scheduleNotificationAsync({
    identifier: restTimerIdentifier,
    content: {
      title: notificationsConfiguration.restAlertTitle,
      body: notificationsConfiguration.restAlertBody,
      sound: false,
      data: { route: sessionRoute },
    },
    trigger: { type: SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false },
  });
}

export async function cancelRestTimerNotification(): Promise<void> {
  await cancelScheduledNotificationAsync(restTimerIdentifier);
}
