import { setNotificationHandler } from 'expo-notifications';

import { foregroundPresentationFor } from '@/notifications/foregroundPresentation';
import { notificationKindForIdentifier } from '@/notifications/notificationIdentifiers';

export function configureNotificationHandler(): void {
  setNotificationHandler({
    handleNotification: async (notification) =>
      foregroundPresentationFor(notificationKindForIdentifier(notification.request.identifier)),
  });
}
