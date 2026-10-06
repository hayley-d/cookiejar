import { describe, expect, test } from 'bun:test';

import { mapRestTimerChange } from '@/notifications/mapRestTimerChange';
import {
  idleRestTimerState,
  pausedRestTimerState,
  resumedRestTimerState,
  startedRestTimerState,
} from '@/sessions/restTimerState';

const startMilliseconds = 1_000_000;

describe('mapRestTimerChange', () => {
  test('schedules the full rest when it starts', () => {
    const running = startedRestTimerState(90, startMilliseconds);
    expect(mapRestTimerChange(idleRestTimerState, running, startMilliseconds)).toEqual({
      kind: 'schedule',
      seconds: 90,
    });
  });

  test('schedules again when a new rest replaces a running one', () => {
    const first = startedRestTimerState(90, startMilliseconds);
    const second = startedRestTimerState(60, startMilliseconds + 10_000);
    expect(mapRestTimerChange(first, second, startMilliseconds + 10_000)).toEqual({ kind: 'schedule', seconds: 60 });
  });

  test('cancels when paused', () => {
    const running = startedRestTimerState(90, startMilliseconds);
    const paused = pausedRestTimerState(running, startMilliseconds + 30_000);
    expect(mapRestTimerChange(running, paused, startMilliseconds + 30_000)).toEqual({ kind: 'cancel' });
  });

  test('schedules the time left when resumed', () => {
    const running = startedRestTimerState(90, startMilliseconds);
    const paused = pausedRestTimerState(running, startMilliseconds + 30_000);
    const resumed = resumedRestTimerState(paused, startMilliseconds + 50_000);
    expect(mapRestTimerChange(paused, resumed, startMilliseconds + 50_000)).toEqual({ kind: 'schedule', seconds: 60 });
  });

  test('cancels when cleared while running', () => {
    const running = startedRestTimerState(90, startMilliseconds);
    expect(mapRestTimerChange(running, idleRestTimerState, startMilliseconds + 5_000)).toEqual({ kind: 'cancel' });
  });

  test('cancels when cleared while paused', () => {
    const paused = pausedRestTimerState(startedRestTimerState(90, startMilliseconds), startMilliseconds + 30_000);
    expect(mapRestTimerChange(paused, idleRestTimerState, startMilliseconds + 40_000)).toEqual({ kind: 'cancel' });
  });

  test('cancels on natural end', () => {
    const running = startedRestTimerState(90, startMilliseconds);
    expect(mapRestTimerChange(running, idleRestTimerState, startMilliseconds + 90_000)).toEqual({ kind: 'cancel' });
  });

  test('does nothing when idle stays idle', () => {
    expect(mapRestTimerChange(idleRestTimerState, idleRestTimerState, startMilliseconds)).toEqual({ kind: 'nothing' });
  });

  test('does not schedule below one second', () => {
    const running = startedRestTimerState(0, startMilliseconds);
    expect(mapRestTimerChange(idleRestTimerState, running, startMilliseconds)).toEqual({ kind: 'cancel' });
  });
});
