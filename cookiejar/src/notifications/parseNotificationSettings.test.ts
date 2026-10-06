import { describe, expect, test } from 'bun:test';

import { encodeNotificationSettings } from '@/notifications/encodeNotificationSettings';
import { reminderLeadMinuteOptions, type NotificationSettings } from '@/notifications/NotificationSettings';
import { parseNotificationSettings } from '@/notifications/parseNotificationSettings';

describe('parseNotificationSettings', () => {
  test('defaults every setting to on with a 30 minute lead time', () => {
    expect(parseNotificationSettings({})).toEqual({
      areWorkoutRemindersEnabled: true,
      reminderLeadMinutes: 30,
      areRestAlertsEnabled: true,
      isWeeklySummaryEnabled: true,
    });
  });

  test('treats null values as missing', () => {
    expect(
      parseNotificationSettings({
        workout_reminders_enabled: null,
        reminder_lead_minutes: null,
        rest_alerts_enabled: null,
        weekly_summary_enabled: null,
      }),
    ).toEqual({
      areWorkoutRemindersEnabled: true,
      reminderLeadMinutes: 30,
      areRestAlertsEnabled: true,
      isWeeklySummaryEnabled: true,
    });
  });

  test('reads each toggle that is turned off', () => {
    expect(
      parseNotificationSettings({
        workout_reminders_enabled: 'false',
        rest_alerts_enabled: 'false',
        weekly_summary_enabled: 'false',
      }),
    ).toEqual({
      areWorkoutRemindersEnabled: false,
      reminderLeadMinutes: 30,
      areRestAlertsEnabled: false,
      isWeeklySummaryEnabled: false,
    });
  });

  test('keeps toggles on for the enabled value', () => {
    const settings = parseNotificationSettings({ workout_reminders_enabled: 'true' });
    expect(settings.areWorkoutRemindersEnabled).toBe(true);
  });

  test('reads each allowed lead time', () => {
    expect(parseNotificationSettings({ reminder_lead_minutes: '15' }).reminderLeadMinutes).toBe(15);
    expect(parseNotificationSettings({ reminder_lead_minutes: '30' }).reminderLeadMinutes).toBe(30);
    expect(parseNotificationSettings({ reminder_lead_minutes: '60' }).reminderLeadMinutes).toBe(60);
  });

  test('falls back to 30 minutes for an unknown lead time', () => {
    expect(parseNotificationSettings({ reminder_lead_minutes: '45' }).reminderLeadMinutes).toBe(30);
    expect(parseNotificationSettings({ reminder_lead_minutes: 'soon' }).reminderLeadMinutes).toBe(30);
  });
});

describe('encodeNotificationSettings', () => {
  test('encodes toggles as true or false and the lead time as digits', () => {
    expect(
      encodeNotificationSettings({
        areWorkoutRemindersEnabled: false,
        reminderLeadMinutes: 60,
        areRestAlertsEnabled: true,
        isWeeklySummaryEnabled: false,
      }),
    ).toEqual({
      workout_reminders_enabled: 'false',
      reminder_lead_minutes: '60',
      rest_alerts_enabled: 'true',
      weekly_summary_enabled: 'false',
    });
  });

  test('round-trips every combination through the parser', () => {
    const booleans = [true, false];
    for (const areWorkoutRemindersEnabled of booleans) {
      for (const areRestAlertsEnabled of booleans) {
        for (const isWeeklySummaryEnabled of booleans) {
          for (const reminderLeadMinutes of reminderLeadMinuteOptions) {
            const settings: NotificationSettings = {
              areWorkoutRemindersEnabled,
              reminderLeadMinutes,
              areRestAlertsEnabled,
              isWeeklySummaryEnabled,
            };
            expect(parseNotificationSettings(encodeNotificationSettings(settings))).toEqual(settings);
          }
        }
      }
    }
  });
});
