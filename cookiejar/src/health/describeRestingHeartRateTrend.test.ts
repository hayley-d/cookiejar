import { describe, expect, test } from 'bun:test';

import type { AverageComparison } from '@/health/compareToAverage';
import { describeRestingHeartRateTrend } from '@/health/describeRestingHeartRateTrend';

function comparison(difference: number, direction: AverageComparison['direction']): AverageComparison {
  return { average: 60, difference, direction, tone: 'default' };
}

describe('describeRestingHeartRateTrend', () => {
  test('describes a drop', () => {
    expect(describeRestingHeartRateTrend(comparison(-2, 'down'))).toBe(
      'down 2 beats per minute from 7-day average',
    );
  });

  test('describes a rise', () => {
    expect(describeRestingHeartRateTrend(comparison(6, 'up'))).toBe('up 6 beats per minute from 7-day average');
  });

  test('uses the singular for one beat', () => {
    expect(describeRestingHeartRateTrend(comparison(1, 'up'))).toBe('up 1 beat per minute from 7-day average');
  });

  test('describes level', () => {
    expect(describeRestingHeartRateTrend(comparison(0, 'level'))).toBe('level with 7-day average');
  });
});
