export const workoutReminderIdentifierPrefix = 'workout-reminder:';

export const weeklySummaryIdentifierPrefix = 'weekly-summary:';

export const restTimerIdentifierPrefix = 'rest-timer:';
export const restTimerIdentifier = `${restTimerIdentifierPrefix}alert`;

export type NotificationKind = 'workoutReminder' | 'weeklySummary' | 'restTimer' | 'other';

export function workoutReminderIdentifier(date: string, planEntryId: number): string {
  return `${workoutReminderIdentifierPrefix}${date}:${planEntryId}`;
}

export function weeklySummaryIdentifier(sundayDate: string): string {
  return `${weeklySummaryIdentifierPrefix}${sundayDate}`;
}

export function notificationKindForIdentifier(identifier: string): NotificationKind {
  if (identifier.startsWith(workoutReminderIdentifierPrefix)) {
    return 'workoutReminder';
  }
  if (identifier.startsWith(weeklySummaryIdentifierPrefix)) {
    return 'weeklySummary';
  }
  if (identifier.startsWith(restTimerIdentifierPrefix)) {
    return 'restTimer';
  }
  return 'other';
}
