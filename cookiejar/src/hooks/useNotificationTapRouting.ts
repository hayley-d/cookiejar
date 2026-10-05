import { type Href, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';

import { markNotificationReadByIdentifier } from '@/database/repositories/notificationRepository';
import {
  type NotificationTap,
  subscribeToNotificationTaps,
  takeLastNotificationTap,
} from '@/notifications/notificationTaps';
import { bumpDataVersion } from '@/stores/dataVersionStore';

export function useNotificationTapRouting(): void {
  const database = useSQLiteContext();

  useEffect(() => {
    const handleNotificationTap = (notificationTap: NotificationTap) => {
      markNotificationReadByIdentifier(database, notificationTap.identifier, new Date())
        .then(bumpDataVersion)
        .catch(() => {});
      if (notificationTap.route !== null) {
        router.push(notificationTap.route as Href);
      }
    };

    const lastNotificationTap = takeLastNotificationTap();
    if (lastNotificationTap !== null) {
      handleNotificationTap(lastNotificationTap);
    }

    return subscribeToNotificationTaps(handleNotificationTap);
  }, [database]);
}
