import { beforeEach, describe, expect, test } from 'bun:test';

import {
  clearRestTimer,
  getRestTimerState,
  pauseRestTimer,
  resumeRestTimer,
  startRestTimer,
  subscribeToRestTimer,
} from '@/stores/restTimerStore';

beforeEach(() => {
  clearRestTimer();
});

describe('restTimerStore', () => {
  test('starts idle', () => {
    expect(getRestTimerState()).toEqual({ status: 'idle' });
  });

  test('starting rest keeps an absolute end time', () => {
    startRestTimer(60, 1_000);
    expect(getRestTimerState()).toEqual({ status: 'running', endsAtMilliseconds: 61_000, durationSeconds: 60 });
  });

  test('starting again restarts rest with the new time', () => {
    startRestTimer(60, 1_000);
    startRestTimer(30, 5_000);
    expect(getRestTimerState()).toEqual({ status: 'running', endsAtMilliseconds: 35_000, durationSeconds: 30 });
  });

  test('pause keeps the remaining seconds and resume sets a new end time', () => {
    startRestTimer(60, 0);
    pauseRestTimer(20_000);
    expect(getRestTimerState()).toEqual({ status: 'paused', remainingSeconds: 40 });
    resumeRestTimer(100_000);
    expect(getRestTimerState()).toEqual({ status: 'running', endsAtMilliseconds: 140_000, durationSeconds: 40 });
  });

  test('clearing returns to idle', () => {
    startRestTimer(60, 0);
    clearRestTimer();
    expect(getRestTimerState()).toEqual({ status: 'idle' });
  });

  test('listeners are told about changes only, and can unsubscribe', () => {
    let notificationCount = 0;
    const unsubscribe = subscribeToRestTimer(() => {
      notificationCount += 1;
    });
    clearRestTimer();
    expect(notificationCount).toBe(0);
    startRestTimer(60, 0);
    expect(notificationCount).toBe(1);
    unsubscribe();
    clearRestTimer();
    expect(notificationCount).toBe(1);
  });
});
