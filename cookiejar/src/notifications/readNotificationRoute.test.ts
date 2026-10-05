import { describe, expect, test } from 'bun:test';

import { readNotificationRoute } from '@/notifications/readNotificationRoute';

describe('readNotificationRoute', () => {
  test('returns the route from the content data', () => {
    expect(readNotificationRoute({ route: '/workout/4?date=2026-10-06' })).toBe('/workout/4?date=2026-10-06');
  });

  test('returns null when there is no data', () => {
    expect(readNotificationRoute(null)).toBeNull();
    expect(readNotificationRoute(undefined)).toBeNull();
  });

  test('returns null for a missing or non-string route', () => {
    expect(readNotificationRoute({})).toBeNull();
    expect(readNotificationRoute({ route: 4 })).toBeNull();
  });

  test('returns null for a route that is not an app path', () => {
    expect(readNotificationRoute({ route: 'https://example.com' })).toBeNull();
  });
});
