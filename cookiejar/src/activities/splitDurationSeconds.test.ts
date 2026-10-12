import { describe, expect, test } from 'bun:test';

import { splitDurationSeconds } from '@/activities/splitDurationSeconds';

describe('splitDurationSeconds', () => {
  test('splits into hours and minutes', () => {
    expect(splitDurationSeconds(2 * 3600 + 15 * 60)).toEqual({ hours: 2, minutes: 15 });
  });

  test('leaves empty parts null', () => {
    expect(splitDurationSeconds(3600)).toEqual({ hours: 1, minutes: null });
    expect(splitDurationSeconds(40 * 60)).toEqual({ hours: null, minutes: 40 });
  });

  test('rounds leftover seconds to the nearest minute', () => {
    expect(splitDurationSeconds(40 * 60 + 40)).toEqual({ hours: null, minutes: 41 });
  });
});
