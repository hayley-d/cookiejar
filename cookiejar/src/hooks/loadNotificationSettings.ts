import type { SQLiteDatabase } from 'expo-sqlite';

import { getSetting } from '@/database/repositories/appSettingsRepository';
import { type NotificationSettingKey, notificationSettingKeys } from '@/notifications/notificationSettingKeys';
import type { NotificationSettings } from '@/notifications/NotificationSettings';
import { parseNotificationSettings, type RawNotificationSettings } from '@/notifications/parseNotificationSettings';

export async function loadNotificationSettings(database: SQLiteDatabase): Promise<NotificationSettings> {
  const rawValues = await Promise.all(notificationSettingKeys.map((key) => getSetting(database, key)));
  const rawSettings: RawNotificationSettings = {};
  notificationSettingKeys.forEach((key: NotificationSettingKey, index) => {
    rawSettings[key] = rawValues[index];
  });
  return parseNotificationSettings(rawSettings);
}
