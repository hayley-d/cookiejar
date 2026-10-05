import { describe, expect, test } from 'bun:test';

import { isGarminSource } from '@/health/isGarminSource';

describe('isGarminSource', () => {
  test('matches a bundle identifier containing garmin in any case', () => {
    expect(isGarminSource({ sourceName: 'Connect', bundleIdentifier: 'com.garmin.connect.mobile' })).toBe(true);
    expect(isGarminSource({ sourceName: 'Connect', bundleIdentifier: 'com.GARMIN.connect' })).toBe(true);
  });

  test('matches a source name containing Garmin', () => {
    expect(isGarminSource({ sourceName: 'Garmin Connect', bundleIdentifier: 'com.example.app' })).toBe(true);
  });

  test('does not match other sources', () => {
    expect(isGarminSource({ sourceName: 'Apple Watch', bundleIdentifier: 'com.apple.health.1234' })).toBe(false);
  });

  test('the source name check is case sensitive', () => {
    expect(isGarminSource({ sourceName: 'garmin connect', bundleIdentifier: 'com.example.app' })).toBe(false);
  });
});
