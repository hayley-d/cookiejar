import { describe, expect, test } from 'bun:test';

import {
  formatActiveKilocalories,
  formatAverageHeartRate,
  formatDistance,
  formatElevationGain,
} from '@/activities/formatActivityValues';

describe('formatDistance', () => {
  test('shows kilometres to two decimal places', () => {
    expect(formatDistance(10000)).toBe('10.00 km');
    expect(formatDistance(5234)).toBe('5.23 km');
    expect(formatDistance(450)).toBe('0.45 km');
  });
});

describe('whole number values', () => {
  test('round to whole numbers with their units', () => {
    expect(formatElevationGain(412.6)).toBe('413 m');
    expect(formatActiveKilocalories(799.5)).toBe('800 kcal');
    expect(formatAverageHeartRate(141.2)).toBe('141 bpm');
  });
});
