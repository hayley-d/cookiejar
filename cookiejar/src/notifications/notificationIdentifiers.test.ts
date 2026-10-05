import { describe, expect, test } from 'bun:test';

import { foregroundPresentationFor } from '@/notifications/foregroundPresentation';
import { notificationKindForIdentifier, workoutReminderIdentifier } from '@/notifications/notificationIdentifiers';

describe('workoutReminderIdentifier', () => {
  test('builds the identifier from the date and the plan entry', () => {
    expect(workoutReminderIdentifier('2026-10-06', 12)).toBe('workout-reminder:2026-10-06:12');
  });
});

describe('notificationKindForIdentifier', () => {
  test('recognises workout reminders by their prefix', () => {
    expect(notificationKindForIdentifier('workout-reminder:2026-10-06:12')).toBe('workoutReminder');
  });

  test('treats any other identifier as other', () => {
    expect(notificationKindForIdentifier('something-else')).toBe('other');
  });
});

describe('foregroundPresentationFor', () => {
  test('shows reminders as a banner and in the list with sound', () => {
    expect(foregroundPresentationFor('workoutReminder')).toEqual({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    });
  });
});
