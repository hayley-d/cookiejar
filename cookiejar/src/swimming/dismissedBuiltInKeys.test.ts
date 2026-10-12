import { describe, expect, test } from 'bun:test';

import { parseDismissedBuiltInKeys, serializeDismissedBuiltInKeys } from '@/swimming/dismissedBuiltInKeys';

describe('dismissed built-in keys', () => {
  test('a missing or malformed value reads as no dismissed keys', () => {
    expect(parseDismissedBuiltInKeys(null)).toEqual([]);
    expect(parseDismissedBuiltInKeys('not json')).toEqual([]);
    expect(parseDismissedBuiltInKeys('{"a":1}')).toEqual([]);
  });

  test('round-trips unique string keys', () => {
    const storedValue = serializeDismissedBuiltInKeys(['swim-a', 'swim-b', 'swim-a']);
    expect(parseDismissedBuiltInKeys(storedValue)).toEqual(['swim-a', 'swim-b']);
  });
});
