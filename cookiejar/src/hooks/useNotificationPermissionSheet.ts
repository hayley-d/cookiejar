import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';

import { getSetting, setSetting } from '@/database/repositories/appSettingsRepository';
import { getNotificationPermissionStatus } from '@/notifications/notificationPermission';
import { notificationPermissionSheetShownAtSettingKey } from '@/notifications/notificationSettingKeys';
import { shouldShowNotificationPermissionSheet } from '@/notifications/shouldShowNotificationPermissionSheet';

export function useNotificationPermissionSheet(): void {
  const database = useSQLiteContext();

  useEffect(() => {
    let isActive = true;

    const openSheetOnFirstVisit = async () => {
      const [sheetShownAt, permissionStatus] = await Promise.all([
        getSetting(database, notificationPermissionSheetShownAtSettingKey),
        getNotificationPermissionStatus(),
      ]);
      if (!isActive || !shouldShowNotificationPermissionSheet({ sheetShownAt, permissionStatus })) {
        return;
      }
      await setSetting(database, notificationPermissionSheetShownAtSettingKey, new Date().toISOString());
      if (isActive) {
        router.push('/notifications/permission');
      }
    };

    openSheetOnFirstVisit().catch(() => {});

    return () => {
      isActive = false;
    };
  }, [database]);
}
