export const workoutReminderIdentifierPrefix = 'workout-reminder:';

export type NotificationKind = 'workoutReminder' | 'other';

export function workoutReminderIdentifier(date: string, planEntryId: number): string {
  return `${workoutReminderIdentifierPrefix}${date}:${planEntryId}`;
}

export function notificationKindForIdentifier(identifier: string): NotificationKind {
  if (identifier.startsWith(workoutReminderIdentifierPrefix)) {
    return 'workoutReminder';
  }
  return 'other';
}
