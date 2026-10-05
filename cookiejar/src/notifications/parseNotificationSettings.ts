import {
  disabledSettingValue,
  type NotificationSettingKey,
  reminderLeadMinutesSettingKey,
  restAlertsEnabledSettingKey,
  weeklySummaryEnabledSettingKey,
  workoutRemindersEnabledSettingKey,
} from '@/notifications/notificationSettingKeys';
import {
  type NotificationSettings,
  type ReminderLeadMinutes,
  reminderLeadMinuteOptions,
} from '@/notifications/NotificationSettings';

export type RawNotificationSettings = Partial<Record<NotificationSettingKey, string | null>>;

const defaultReminderLeadMinutes: ReminderLeadMinutes = 30;

function parseEnabled(rawValue: string | null | undefined): boolean {
  return rawValue !== disabledSettingValue;
}

function parseReminderLeadMinutes(rawValue: string | null | undefined): ReminderLeadMinutes {
  const matchingOption = reminderLeadMinuteOptions.find((option) => String(option) === rawValue);
  return matchingOption ?? defaultReminderLeadMinutes;
}

export function parseNotificationSettings(rawSettings: RawNotificationSettings): NotificationSettings {
  return {
    areWorkoutRemindersEnabled: parseEnabled(rawSettings[workoutRemindersEnabledSettingKey]),
    reminderLeadMinutes: parseReminderLeadMinutes(rawSettings[reminderLeadMinutesSettingKey]),
    areRestAlertsEnabled: parseEnabled(rawSettings[restAlertsEnabledSettingKey]),
    isWeeklySummaryEnabled: parseEnabled(rawSettings[weeklySummaryEnabledSettingKey]),
  };
}
