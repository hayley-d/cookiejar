export const reminderLeadMinuteOptions = [15, 30, 60] as const;

export type ReminderLeadMinutes = (typeof reminderLeadMinuteOptions)[number];

export type NotificationSettings = {
  areWorkoutRemindersEnabled: boolean;
  reminderLeadMinutes: ReminderLeadMinutes;
  areRestAlertsEnabled: boolean;
  isWeeklySummaryEnabled: boolean;
};
