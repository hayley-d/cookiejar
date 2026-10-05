import { describe, expect, test } from 'bun:test';

import { missingHealthValue } from '@/health/formatSteps';
import { describeStatValue } from '@/stats/describeStatValue';

describe('describeStatValue', () => {
  test('reads a missing value as no data', () => {
    expect(describeStatValue(missingHealthValue)).toBe('no data');
  });

  test('keeps a present value as it is', () => {
    expect(describeStatValue('8,200')).toBe('8,200');
    expect(describeStatValue('3 / 4')).toBe('3 / 4');
  });
});
