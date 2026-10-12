import { describe, expect, test } from 'bun:test';

import { describeSwimPace, deriveSecondsPerHundredMeters, formatSwimPace } from '@/swimming/swimPace';

describe('deriveSecondsPerHundredMeters', () => {
  test('is null when nothing was swum', () => {
    expect(deriveSecondsPerHundredMeters(2400, 0)).toBeNull();
  });

  test('is null without a duration', () => {
    expect(deriveSecondsPerHundredMeters(0, 1700)).toBeNull();
  });

  test('divides duration by hundreds of metres', () => {
    expect(deriveSecondsPerHundredMeters(200, 200)).toBe(100);
  });
});

describe('formatSwimPace', () => {
  test('pads seconds', () => {
    expect(formatSwimPace(125)).toBe('2:05 /100 m');
  });

  test('rounds to the nearest second', () => {
    expect(formatSwimPace(141.18)).toBe('2:21 /100 m');
    expect(formatSwimPace(141.5)).toBe('2:22 /100 m');
  });
});

describe('describeSwimPace', () => {
  test('gives the phase example of 1,700 m in 40:00', () => {
    expect(describeSwimPace(2400, 1700)).toBe('2:21 /100 m');
  });

  test('is null for zero distance', () => {
    expect(describeSwimPace(2400, 0)).toBeNull();
  });
});
