import { describe, expect, test } from 'bun:test';

import {
  addDismissedBuiltInKey,
  parseDismissedBuiltInKeys,
  serializeDismissedBuiltInKeys,
} from '@/swimming/dismissedBuiltInKeys';

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

  test('adding a key keeps earlier keys and ignores repeats', () => {
    const afterFirstDismissal = addDismissedBuiltInKey(null, 'beginner-1-a');
    const afterSecondDismissal = addDismissedBuiltInKey(afterFirstDismissal, 'beginner-1-b');
    const afterRepeatedDismissal = addDismissedBuiltInKey(afterSecondDismissal, 'beginner-1-a');
    expect(parseDismissedBuiltInKeys(afterRepeatedDismissal)).toEqual(['beginner-1-a', 'beginner-1-b']);
  });

  test('adding a key to a malformed value starts a fresh list', () => {
    expect(parseDismissedBuiltInKeys(addDismissedBuiltInKey('not json', 'beginner-1-a'))).toEqual(['beginner-1-a']);
  });
});
