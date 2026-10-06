import { describe, expect, test } from 'bun:test';

import { isCurrentRoute } from '@/notifications/isCurrentRoute';

describe('isCurrentRoute', () => {
  test('matches the same path', () => {
    expect(isCurrentRoute('/sessions/12', '/sessions/12')).toBe(true);
  });

  test('ignores the query and the hash of the route', () => {
    expect(isCurrentRoute('/workout/4?date=2026-10-06', '/workout/4')).toBe(true);
    expect(isCurrentRoute('/workout/4#top', '/workout/4')).toBe(true);
  });

  test('does not match a different path', () => {
    expect(isCurrentRoute('/sessions/12', '/sessions/13')).toBe(false);
    expect(isCurrentRoute('/sessions/12', '/')).toBe(false);
  });
});
