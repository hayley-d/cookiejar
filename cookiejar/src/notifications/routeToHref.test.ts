import { describe, expect, test } from 'bun:test';

import { routeToHref } from '@/notifications/routeToHref';

describe('routeToHref', () => {
  test('fills dynamic segments and puts the other params in the query', () => {
    expect(
      routeToHref({
        pathname: '/workout/[workoutId]',
        params: { workoutId: '4', date: '2026-10-06', planEntryId: '12' },
      }),
    ).toBe('/workout/4?date=2026-10-06&planEntryId=12');
  });

  test('leaves out the query when every param is a segment', () => {
    expect(routeToHref({ pathname: '/sessions/[sessionId]', params: { sessionId: '9' } })).toBe('/sessions/9');
  });

  test('keeps a static pathname', () => {
    expect(routeToHref({ pathname: '/coach', params: {} })).toBe('/coach');
  });

  test('encodes values', () => {
    expect(routeToHref({ pathname: '/search', params: { text: 'a b&c' } })).toBe('/search?text=a%20b%26c');
  });
});
