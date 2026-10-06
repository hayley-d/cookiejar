import { type Href, router, usePathname } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';

import { markNotificationReadByIdentifier } from '@/database/repositories/notificationRepository';
import { isCurrentRoute } from '@/notifications/isCurrentRoute';
import { notificationKindForIdentifier } from '@/notifications/notificationIdentifiers';
import {
  type NotificationTap,
  subscribeToNotificationTaps,
  takeLastNotificationTap,
} from '@/notifications/notificationTaps';
import { reportNotificationError } from '@/notifications/reportNotificationError';
import { bumpDataVersion } from '@/stores/dataVersionStore';

export function useNotificationTapRouting(): void {
  const database = useSQLiteContext();
  const pathname = usePathname();
  const pathnameReference = useRef(pathname);

  useEffect(() => {
    pathnameReference.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const handleNotificationTap = (notificationTap: NotificationTap) => {
      if (notificationKindForIdentifier(notificationTap.identifier) !== 'restTimer') {
        markNotificationReadByIdentifier(database, notificationTap.identifier, new Date())
          .then(bumpDataVersion)
          .catch(reportNotificationError);
      }
      if (notificationTap.route !== null && !isCurrentRoute(notificationTap.route, pathnameReference.current)) {
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
