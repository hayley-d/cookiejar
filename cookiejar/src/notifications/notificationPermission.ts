import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications';

import type { NotificationPermissionStatus } from '@/notifications/NotificationPermissionStatus';

export type NotificationPermissionOutcome = 'granted' | 'denied';

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  try {
    const currentPermission = await getPermissionsAsync();
    if (currentPermission.granted) {
      return 'granted';
    }
    return currentPermission.canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'denied';
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermissionOutcome> {
  try {
    const currentPermission = await getPermissionsAsync();
    if (currentPermission.granted) {
      return 'granted';
    }
    if (!currentPermission.canAskAgain) {
      return 'denied';
    }
    const requestedPermission = await requestPermissionsAsync();
    return requestedPermission.granted ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}
