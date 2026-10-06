import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { countPastUnreadNotifications } from '@/database/repositories/notificationRepository';
import { useFocusReloadKey } from '@/hooks/useFocusReloadKey';
import { reportNotificationError } from '@/notifications/reportNotificationError';
import { useDataVersion } from '@/stores/dataVersionStore';

export function useUnreadNotificationCount(): number {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const focusCount = useFocusReloadKey();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    countPastUnreadNotifications(database, new Date()).then((loadedCount) => {
      if (isActive) {
        setUnreadCount(loadedCount);
      }
    }, reportNotificationError);
    return () => {
      isActive = false;
    };
  }, [database, dataVersion, focusCount]);

  return unreadCount;
}
