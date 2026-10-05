import { describe, expect, test } from 'bun:test';

import { describeActiveSince } from '@/plans/describeActiveSince';

describe('describeActiveSince', () => {
  test('formats weekday, day and month', () => {
    expect(describeActiveSince('2026-10-05')).toBe('Active since Mon 5 Oct');
  });

  test('does not pad the day and handles Sunday', () => {
    expect(describeActiveSince('2026-01-04')).toBe('Active since Sun 4 Jan');
  });

  test('rejects an invalid date', () => {
    expect(() => describeActiveSince('2026-02-30')).toThrow();
  });
});
