export const workoutRemindersEnabledSettingKey = 'workout_reminders_enabled';
export const reminderLeadMinutesSettingKey = 'reminder_lead_minutes';
export const restAlertsEnabledSettingKey = 'rest_alerts_enabled';
export const weeklySummaryEnabledSettingKey = 'weekly_summary_enabled';

export const notificationSettingKeys = [
  workoutRemindersEnabledSettingKey,
  reminderLeadMinutesSettingKey,
  restAlertsEnabledSettingKey,
  weeklySummaryEnabledSettingKey,
] as const;

export type NotificationSettingKey = (typeof notificationSettingKeys)[number];

export const enabledSettingValue = 'true';
export const disabledSettingValue = 'false';

export const notificationPermissionSheetShownAtSettingKey = 'notification_permission_sheet_shown_at';
