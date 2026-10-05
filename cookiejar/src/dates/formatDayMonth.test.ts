import { expect, test } from 'bun:test';

import { formatDayMonth } from '@/dates/formatDayMonth';

test('formats a local date as day and short month', () => {
  expect(formatDayMonth('2026-10-05')).toBe('5 Oct');
  expect(formatDayMonth('2026-12-31')).toBe('31 Dec');
});
