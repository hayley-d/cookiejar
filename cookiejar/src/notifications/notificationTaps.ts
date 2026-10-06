import {
  addNotificationResponseReceivedListener,
  clearLastNotificationResponse,
  DEFAULT_ACTION_IDENTIFIER,
  getLastNotificationResponse,
  type NotificationResponse,
} from 'expo-notifications';

import { readNotificationRoute } from '@/notifications/readNotificationRoute';

export type NotificationTap = {
  identifier: string;
  route: string | null;
};

let lastHandledResponseKey: string | null = null;

function toNotificationTap(response: NotificationResponse): NotificationTap | null {
  if (response.actionIdentifier !== DEFAULT_ACTION_IDENTIFIER) {
    return null;
  }
  const { request, date } = response.notification;
  const responseKey = `${request.identifier}:${date}`;
  if (responseKey === lastHandledResponseKey) {
    return null;
  }
  lastHandledResponseKey = responseKey;
  return {
    identifier: request.identifier,
    route: readNotificationRoute(request.content.data),
  };
}

export function takeLastNotificationTap(): NotificationTap | null {
  try {
    const response = getLastNotificationResponse();
    if (response === null) {
      return null;
    }
    clearLastNotificationResponse();
    return toNotificationTap(response);
  } catch {
    return null;
  }
}

export function subscribeToNotificationTaps(listener: (notificationTap: NotificationTap) => void): () => void {
  const subscription = addNotificationResponseReceivedListener((response) => {
    const notificationTap = toNotificationTap(response);
    if (notificationTap !== null) {
      listener(notificationTap);
    }
  });
  return () => {
    subscription.remove();
  };
}
