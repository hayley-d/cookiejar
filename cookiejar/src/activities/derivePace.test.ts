import { describe, expect, test } from 'bun:test';

import { derivePaceSecondsPerKilometer, describePace, formatPace } from '@/activities/derivePace';

describe('derivePaceSecondsPerKilometer', () => {
  test('divides the duration by the distance in kilometres', () => {
    expect(derivePaceSecondsPerKilometer(10000, 55 * 60)).toBe(330);
    expect(derivePaceSecondsPerKilometer(5000, 30 * 60)).toBe(360);
  });

  test('is null when the distance is missing or not above zero', () => {
    expect(derivePaceSecondsPerKilometer(null, 3000)).toBeNull();
    expect(derivePaceSecondsPerKilometer(0, 3000)).toBeNull();
    expect(derivePaceSecondsPerKilometer(-5, 3000)).toBeNull();
  });

  test('is null when the duration is missing or not above zero', () => {
    expect(derivePaceSecondsPerKilometer(5000, null)).toBeNull();
    expect(derivePaceSecondsPerKilometer(5000, 0)).toBeNull();
  });
});

describe('formatPace', () => {
  test('shows minutes and two-digit seconds per kilometre', () => {
    expect(formatPace(330)).toBe('5:30 /km');
    expect(formatPace(365)).toBe('6:05 /km');
    expect(formatPace(600)).toBe('10:00 /km');
  });

  test('rounds to the nearest second and carries into the minute', () => {
    expect(formatPace(329.4)).toBe('5:29 /km');
    expect(formatPace(329.5)).toBe('5:30 /km');
    expect(formatPace(359.6)).toBe('6:00 /km');
  });
});

describe('describePace', () => {
  test('formats 10.0 km in 55 minutes as 5:30 /km', () => {
    expect(describePace(10000, 55 * 60)).toBe('5:30 /km');
  });

  test('is null when the pace cannot be derived', () => {
    expect(describePace(null, 3300)).toBeNull();
    expect(describePace(0, 3300)).toBeNull();
  });
});
