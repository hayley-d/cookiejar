export const workoutReminderIdentifierPrefix = 'workout-reminder:';

export const restTimerIdentifierPrefix = 'rest-timer:';
export const restTimerIdentifier = `${restTimerIdentifierPrefix}alert`;

export type NotificationKind = 'workoutReminder' | 'restTimer' | 'other';

export function workoutReminderIdentifier(date: string, planEntryId: number): string {
  return `${workoutReminderIdentifierPrefix}${date}:${planEntryId}`;
}

export function notificationKindForIdentifier(identifier: string): NotificationKind {
  if (identifier.startsWith(workoutReminderIdentifierPrefix)) {
    return 'workoutReminder';
  }
  if (identifier.startsWith(restTimerIdentifierPrefix)) {
    return 'restTimer';
  }
  return 'other';
}
