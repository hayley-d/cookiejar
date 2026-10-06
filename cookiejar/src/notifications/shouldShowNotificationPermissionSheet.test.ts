import { describe, expect, test } from 'bun:test';

import { shouldShowNotificationPermissionSheet } from '@/notifications/shouldShowNotificationPermissionSheet';

describe('shouldShowNotificationPermissionSheet', () => {
  test('shows on the first visit while permission is undetermined', () => {
    expect(shouldShowNotificationPermissionSheet({ sheetShownAt: null, permissionStatus: 'undetermined' })).toBe(true);
  });

  test('does not show again once it has been shown', () => {
    expect(
      shouldShowNotificationPermissionSheet({
        sheetShownAt: '2026-10-06T08:00:00.000Z',
        permissionStatus: 'undetermined',
      }),
    ).toBe(false);
  });

  test('does not show when permission is already granted', () => {
    expect(shouldShowNotificationPermissionSheet({ sheetShownAt: null, permissionStatus: 'granted' })).toBe(false);
  });

  test('does not show when permission is already denied', () => {
    expect(shouldShowNotificationPermissionSheet({ sheetShownAt: null, permissionStatus: 'denied' })).toBe(false);
  });
});
