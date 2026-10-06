import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

import {
  listPastNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/database/repositories/notificationRepository";
import { useFocusReloadKey } from "@/hooks/useFocusReloadKey";
import { bumpDataVersion, useDataVersion } from "@/stores/dataVersionStore";
import type { AppNotification } from "@/types/AppNotification";

export function useNotifications() {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const focusCount = useFocusReloadKey();
  const [notifications, setNotifications] = useState<AppNotification[] | null>(
    null,
  );
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  useEffect(() => {
    let isActive = true;
    listPastNotifications(database, new Date()).then(
      (loadedNotifications) => {
        if (isActive) {
          setNotifications(loadedNotifications);
          setHasLoadFailed(false);
        }
      },
      () => {
        if (isActive) {
          setHasLoadFailed(true);
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [database, dataVersion, focusCount]);

  const markRead = useCallback(
    async (notificationId: number) => {
      await markNotificationRead(database, notificationId, new Date());
      bumpDataVersion();
    },
    [database],
  );

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead(database, new Date());
    bumpDataVersion();
  }, [database]);

  return { notifications, hasLoadFailed, markRead, markAllRead };
}
