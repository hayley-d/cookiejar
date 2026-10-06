import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
} from '@/notifications/notificationPermission';
import type { NotificationPermissionStatus } from '@/notifications/NotificationPermissionStatus';
import { openNotificationSystemSettings } from '@/notifications/openNotificationSystemSettings';
import { reportNotificationError } from '@/notifications/reportNotificationError';
import { bumpDataVersion } from '@/stores/dataVersionStore';

export function useNotificationPermissionStatus() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus | null>(null);

  const refreshStatus = useCallback(() => {
    getNotificationPermissionStatus().then(setPermissionStatus, reportNotificationError);
  }, []);

  useFocusEffect(refreshStatus);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refreshStatus();
      }
    });
    return () => subscription.remove();
  }, [refreshStatus]);

  const askForPermission = useCallback(async () => {
    try {
      await requestNotificationPermission();
    } catch (error) {
      reportNotificationError(error);
    }
    refreshStatus();
    bumpDataVersion();
  }, [refreshStatus]);

  const openSystemSettings = useCallback(() => {
    openNotificationSystemSettings().catch(reportNotificationError);
  }, []);

  return { permissionStatus, askForPermission, openSystemSettings };
}
