import { describe, expect, test } from 'bun:test';

import {
  displayedCountdownSeconds,
  elapsedSecondsSince,
  hasCountdownFinished,
  planCountdown,
  recordedCountdownSeconds,
} from '@/sessions/countdownProgress';

describe('planCountdown', () => {
  test('counts down from the target', () => {
    expect(planCountdown(60, null)).toEqual({ direction: 'down', startSeconds: 60 });
  });

  test('counts down from the current value when there is no target', () => {
    expect(planCountdown(null, 45)).toEqual({ direction: 'down', startSeconds: 45 });
  });

  test('prefers the target over the current value', () => {
    expect(planCountdown(60, 45)).toEqual({ direction: 'down', startSeconds: 60 });
  });

  test('counts up with no target and no value', () => {
    expect(planCountdown(null, null)).toEqual({ direction: 'up' });
    expect(planCountdown(0, 0)).toEqual({ direction: 'up' });
  });
});

describe('elapsedSecondsSince', () => {
  test('floors to whole seconds and never goes negative', () => {
    expect(elapsedSecondsSince(1000, 3999)).toBe(2);
    expect(elapsedSecondsSince(5000, 1000)).toBe(0);
  });
});

describe('displayedCountdownSeconds', () => {
  test('counts down to zero and stops there', () => {
    const plan = { direction: 'down', startSeconds: 60 } as const;
    expect(displayedCountdownSeconds(plan, 15)).toBe(45);
    expect(displayedCountdownSeconds(plan, 90)).toBe(0);
  });

  test('counts up from zero', () => {
    expect(displayedCountdownSeconds({ direction: 'up' }, 12)).toBe(12);
  });
});

describe('hasCountdownFinished', () => {
  test('finishes when a countdown reaches zero', () => {
    const plan = { direction: 'down', startSeconds: 60 } as const;
    expect(hasCountdownFinished(plan, 59)).toBe(false);
    expect(hasCountdownFinished(plan, 60)).toBe(true);
  });

  test('a count up never finishes by itself', () => {
    expect(hasCountdownFinished({ direction: 'up' }, 9999)).toBe(false);
  });
});

describe('recordedCountdownSeconds', () => {
  test('records the elapsed seconds, capped at the countdown start', () => {
    const plan = { direction: 'down', startSeconds: 60 } as const;
    expect(recordedCountdownSeconds(plan, 20)).toBe(20);
    expect(recordedCountdownSeconds(plan, 75)).toBe(60);
    expect(recordedCountdownSeconds({ direction: 'up' }, 75)).toBe(75);
  });
});
