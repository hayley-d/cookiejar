import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications';

export type NotificationPermissionOutcome = 'granted' | 'denied';

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
