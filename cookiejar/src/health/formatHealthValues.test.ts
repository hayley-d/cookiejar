import { describe, expect, test } from 'bun:test';

import { formatRestingHeartRate } from '@/health/formatRestingHeartRate';
import { formatSleepMinutes } from '@/health/formatSleepMinutes';

describe('formatSleepMinutes', () => {
  test('shows hours and minutes', () => {
    expect(formatSleepMinutes(432)).toBe('7h 12m');
    expect(formatSleepMinutes(420)).toBe('7h 0m');
    expect(formatSleepMinutes(45)).toBe('0h 45m');
  });

  test('shows a dash for null', () => {
    expect(formatSleepMinutes(null)).toBe('—');
  });

  test('never shows a negative duration', () => {
    expect(formatSleepMinutes(-5)).toBe('0h 0m');
  });
});

describe('formatRestingHeartRate', () => {
  test('shows beats per minute rounded', () => {
    expect(formatRestingHeartRate(54)).toBe('54 bpm');
    expect(formatRestingHeartRate(53.6)).toBe('54 bpm');
  });

  test('shows a dash for null', () => {
    expect(formatRestingHeartRate(null)).toBe('—');
  });
});
