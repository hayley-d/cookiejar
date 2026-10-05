import { describe, expect, test } from 'bun:test';

import { describeWeightSummary } from '@/progress/describeWeightSummary';

describe('describeWeightSummary', () => {
  test('shows a loss with a down arrow', () => {
    expect(describeWeightSummary(72.4, -0.6, 30)).toBe('72.4 kg ↓0.6 kg in 30 days');
  });

  test('shows a gain with an up arrow', () => {
    expect(describeWeightSummary(72.4, 1.2, 30)).toBe('72.4 kg ↑1.2 kg in 30 days');
  });

  test('says no change for zero', () => {
    expect(describeWeightSummary(72, 0, 30)).toBe('72 kg no change in 30 days');
  });

  test('hides the change when it is null', () => {
    expect(describeWeightSummary(72.4, null, 30)).toBe('72.4 kg');
  });
});
