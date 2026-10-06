import {
  disabledSettingValue,
  enabledSettingValue,
  type NotificationSettingKey,
  reminderLeadMinutesSettingKey,
  restAlertsEnabledSettingKey,
  weeklySummaryEnabledSettingKey,
  workoutRemindersEnabledSettingKey,
} from '@/notifications/notificationSettingKeys';
import type { NotificationSettings } from '@/notifications/NotificationSettings';

export type EncodedNotificationSettings = Record<NotificationSettingKey, string>;

function encodeEnabled(isEnabled: boolean): string {
  return isEnabled ? enabledSettingValue : disabledSettingValue;
}

export function encodeNotificationSettings(settings: NotificationSettings): EncodedNotificationSettings {
  return {
    [workoutRemindersEnabledSettingKey]: encodeEnabled(settings.areWorkoutRemindersEnabled),
    [reminderLeadMinutesSettingKey]: String(settings.reminderLeadMinutes),
    [restAlertsEnabledSettingKey]: encodeEnabled(settings.areRestAlertsEnabled),
    [weeklySummaryEnabledSettingKey]: encodeEnabled(settings.isWeeklySummaryEnabled),
  };
}
