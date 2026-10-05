import { describe, expect, test } from 'bun:test';

import { exerciseMetricValueFormatters } from '@/progress/exerciseMetrics';

describe('exerciseMetricValueFormatters', () => {
  test('formats durations as hours, minutes and seconds', () => {
    const formatDurationValue = exerciseMetricValueFormatters.longestDuration;
    expect(formatDurationValue?.(2700)).toBe('45m');
    expect(formatDurationValue?.(5400)).toBe('1h 30m');
  });

  test('formats distances in kilometres from 1000 metres', () => {
    const formatDistanceValue = exerciseMetricValueFormatters.longestDistance;
    expect(formatDistanceValue?.(5000)).toBe('5 km');
    expect(formatDistanceValue?.(800)).toBe('800 m');
  });

  test('leaves weight and repetition metrics on the unit suffix', () => {
    expect(exerciseMetricValueFormatters.heaviestWeight).toBeUndefined();
    expect(exerciseMetricValueFormatters.mostRepetitions).toBeUndefined();
  });
});
