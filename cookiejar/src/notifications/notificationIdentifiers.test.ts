import { describe, expect, test } from 'bun:test';

import { foregroundPresentationFor } from '@/notifications/foregroundPresentation';
import {
  notificationKindForIdentifier,
  restTimerIdentifier,
  workoutReminderIdentifier,
} from '@/notifications/notificationIdentifiers';

describe('workoutReminderIdentifier', () => {
  test('builds the identifier from the date and the plan entry', () => {
    expect(workoutReminderIdentifier('2026-10-06', 12)).toBe('workout-reminder:2026-10-06:12');
  });
});

describe('notificationKindForIdentifier', () => {
  test('recognises workout reminders by their prefix', () => {
    expect(notificationKindForIdentifier('workout-reminder:2026-10-06:12')).toBe('workoutReminder');
  });

  test('recognises the rest alert by its prefix', () => {
    expect(notificationKindForIdentifier(restTimerIdentifier)).toBe('restTimer');
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

describe('foregroundPresentationFor the rest alert', () => {
  test('shows no banner, list or sound', () => {
    expect(foregroundPresentationFor('restTimer')).toEqual({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    });
  });
});
