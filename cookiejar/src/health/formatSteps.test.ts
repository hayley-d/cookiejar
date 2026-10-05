import { describe, expect, test } from 'bun:test';

import { formatSteps, missingHealthValue } from '@/health/formatSteps';

describe('formatSteps', () => {
  test('shows a dash when there is no value', () => {
    expect(formatSteps(null)).toBe(missingHealthValue);
    expect(missingHealthValue).toBe('—');
  });

  test('groups thousands', () => {
    expect(formatSteps(0)).toBe('0');
    expect(formatSteps(987)).toBe('987');
    expect(formatSteps(8432)).toBe('8,432');
    expect(formatSteps(12345678)).toBe('12,345,678');
  });

  test('rounds to a whole step', () => {
    expect(formatSteps(8431.6)).toBe('8,432');
  });
});
