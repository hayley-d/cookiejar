import { describe, expect, test } from 'bun:test';

import { nextSundayAtSeven } from '@/notifications/nextSundayAtSeven';

describe('nextSundayAtSeven', () => {
  test('is today on a Sunday before 19:00', () => {
    expect(nextSundayAtSeven(new Date(2026, 9, 11, 9, 30))).toEqual(new Date(2026, 9, 11, 19, 0, 0, 0));
  });

  test('is next Sunday on a Sunday at 19:00', () => {
    expect(nextSundayAtSeven(new Date(2026, 9, 11, 19, 0, 0, 0))).toEqual(new Date(2026, 9, 18, 19, 0, 0, 0));
  });

  test('is next Sunday on a Sunday after 19:00', () => {
    expect(nextSundayAtSeven(new Date(2026, 9, 11, 22, 15))).toEqual(new Date(2026, 9, 18, 19, 0, 0, 0));
  });

  test('is the coming Sunday on a mid-week day', () => {
    expect(nextSundayAtSeven(new Date(2026, 9, 7, 12, 0))).toEqual(new Date(2026, 9, 11, 19, 0, 0, 0));
  });

  test('is the coming Sunday on a Monday', () => {
    expect(nextSundayAtSeven(new Date(2026, 9, 5, 0, 0))).toEqual(new Date(2026, 9, 11, 19, 0, 0, 0));
  });

  test('crosses a month boundary', () => {
    expect(nextSundayAtSeven(new Date(2026, 9, 28, 8, 0))).toEqual(new Date(2026, 10, 1, 19, 0, 0, 0));
  });
});
