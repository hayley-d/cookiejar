import { describe, expect, test } from 'bun:test';

import { statsDetailDayCount, statsDetailHint } from '@/stats/statsDetail';

describe('statsDetail', () => {
  test('the hint is derived from the day count', () => {
    expect(statsDetailHint).toBe(`Opens the last ${statsDetailDayCount} days`);
  });
});
