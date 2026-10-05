import { describe, expect, test } from 'bun:test';

import {
  hasRestTimerEnded,
  idleRestTimerState,
  pausedRestTimerState,
  remainingRestSeconds,
  resumedRestTimerState,
  startedRestTimerState,
} from '@/sessions/restTimerState';

describe('restTimerState', () => {
  test('a started timer ends at an absolute time', () => {
    expect(startedRestTimerState(90, 10_000)).toEqual({ status: 'running', endsAtMilliseconds: 100_000, durationSeconds: 90 });
  });

  test('remaining seconds follow the clock, so time spent in the background counts', () => {
    const state = startedRestTimerState(90, 0);
    expect(remainingRestSeconds(state, 0)).toBe(90);
    expect(remainingRestSeconds(state, 30_500)).toBe(60);
    expect(remainingRestSeconds(state, 200_000)).toBe(0);
  });

  test('a clock reading from before the timer started never shows more than its full duration', () => {
    expect(remainingRestSeconds(startedRestTimerState(90, 600_000), 0)).toBe(90);
  });

  test('an idle timer has no remaining seconds', () => {
    expect(remainingRestSeconds(idleRestTimerState, 0)).toBeNull();
  });

  test('pausing keeps the remaining seconds and resuming sets a new end time', () => {
    const paused = pausedRestTimerState(startedRestTimerState(90, 0), 30_000);
    expect(paused).toEqual({ status: 'paused', remainingSeconds: 60 });
    expect(remainingRestSeconds(paused, 500_000)).toBe(60);
    expect(resumedRestTimerState(paused, 100_000)).toEqual({ status: 'running', endsAtMilliseconds: 160_000, durationSeconds: 60 });
  });

  test('pausing an idle timer and resuming a running timer change nothing', () => {
    const running = startedRestTimerState(90, 0);
    expect(pausedRestTimerState(idleRestTimerState, 0)).toBe(idleRestTimerState);
    expect(resumedRestTimerState(running, 10)).toBe(running);
  });

  test('a running timer has ended once its end time is reached', () => {
    const running = startedRestTimerState(10, 0);
    expect(hasRestTimerEnded(running, 9_999)).toBe(false);
    expect(hasRestTimerEnded(running, 10_000)).toBe(true);
    expect(hasRestTimerEnded(pausedRestTimerState(running, 1_000), 999_999)).toBe(false);
    expect(hasRestTimerEnded(idleRestTimerState, 999_999)).toBe(false);
  });
});
