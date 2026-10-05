import { describe, expect, test } from 'bun:test';

import { parseStatsMetric } from '@/stats/parseStatsMetric';

describe('parseStatsMetric', () => {
  test('accepts the four metrics', () => {
    expect(parseStatsMetric('steps')).toBe('steps');
    expect(parseStatsMetric('sleep')).toBe('sleep');
    expect(parseStatsMetric('restingHeartRate')).toBe('restingHeartRate');
    expect(parseStatsMetric('streak')).toBe('streak');
  });

  test('rejects anything else', () => {
    expect(parseStatsMetric('weight')).toBeNull();
    expect(parseStatsMetric('')).toBeNull();
    expect(parseStatsMetric(undefined)).toBeNull();
  });
});
