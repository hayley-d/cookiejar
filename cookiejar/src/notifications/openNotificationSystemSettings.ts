import { Linking } from 'react-native';

export async function openNotificationSystemSettings(): Promise<void> {
  await Linking.openSettings();
}
