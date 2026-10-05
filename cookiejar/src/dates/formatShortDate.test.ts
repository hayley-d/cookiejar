import { expect, test } from 'bun:test';

import { formatShortDate } from '@/dates/formatShortDate';

test('formats a local date as short weekday, day and month', () => {
  expect(formatShortDate('2026-10-05')).toBe('Mon 5 Oct');
  expect(formatShortDate('2026-12-31')).toBe('Thu 31 Dec');
});
