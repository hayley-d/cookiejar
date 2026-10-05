import { describe, expect, test } from 'bun:test';

import { describeStepProgress, formatCompactStepGoal } from '@/health/describeStepProgress';

describe('formatCompactStepGoal', () => {
  test('writes thousands compactly', () => {
    expect(formatCompactStepGoal(10000)).toBe('10k');
    expect(formatCompactStepGoal(8500)).toBe('8.5k');
    expect(formatCompactStepGoal(12000)).toBe('12k');
  });

  test('leaves goals under a thousand as they are', () => {
    expect(formatCompactStepGoal(800)).toBe('800');
  });
});

describe('describeStepProgress', () => {
  test('rounds the percentage down and captions it', () => {
    const progress = describeStepProgress(7842, 10000);
    expect(progress.percentage).toBe(78);
    expect(progress.caption).toBe('78% of 10k');
    expect(progress.ringProgress).toBeCloseTo(0.7842);
    expect(progress.isGoalReached).toBe(false);
  });

  test('never shows 100% before the goal is reached', () => {
    const progress = describeStepProgress(9999, 10000);
    expect(progress.percentage).toBe(99);
    expect(progress.isGoalReached).toBe(false);
  });

  test('reaches the goal exactly and beyond', () => {
    expect(describeStepProgress(10000, 10000).isGoalReached).toBe(true);
    const beyond = describeStepProgress(15000, 10000);
    expect(beyond.percentage).toBe(150);
    expect(beyond.ringProgress).toBe(1);
    expect(beyond.isGoalReached).toBe(true);
  });

  test('handles zero steps and an invalid goal', () => {
    expect(describeStepProgress(0, 10000).caption).toBe('0% of 10k');
    const noGoal = describeStepProgress(500, 0);
    expect(noGoal.percentage).toBe(0);
    expect(noGoal.isGoalReached).toBe(false);
    expect(noGoal.ringProgress).toBe(0);
  });
});
