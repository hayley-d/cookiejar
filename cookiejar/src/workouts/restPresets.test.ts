import { describe, expect, test } from 'bun:test';

import { formatRestSeconds, restPresetOptions, restSecondsForPresetIndex } from '@/workouts/restPresets';

describe('restPresets', () => {
  test('the options are Off, 30s, 45s, 60s, 90s, 2m, 3m', () => {
    expect(restPresetOptions).toEqual(['Off', '30s', '45s', '60s', '90s', '2m', '3m']);
  });

  test('index zero turns the rest off and later indexes map to seconds', () => {
    expect(restSecondsForPresetIndex(0)).toBeNull();
    expect(restSecondsForPresetIndex(4)).toBe(90);
    expect(restSecondsForPresetIndex(6)).toBe(180);
  });

  test('an index past the presets is undefined', () => {
    expect(restSecondsForPresetIndex(7)).toBeUndefined();
  });
});

describe('formatRestSeconds', () => {
  test('shows seconds under two minutes and minutes from there', () => {
    expect(formatRestSeconds(90)).toBe('90s');
    expect(formatRestSeconds(120)).toBe('2m');
    expect(formatRestSeconds(150)).toBe('2m 30s');
  });
});
