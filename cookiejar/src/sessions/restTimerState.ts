const millisecondsPerSecond = 1000;

export type RestTimerState =
  | { status: 'idle' }
  | { status: 'running'; endsAtMilliseconds: number; durationSeconds: number }
  | { status: 'paused'; remainingSeconds: number };

export const idleRestTimerState: RestTimerState = { status: 'idle' };

export function startedRestTimerState(restSeconds: number, nowMilliseconds: number): RestTimerState {
  return {
    status: 'running',
    endsAtMilliseconds: nowMilliseconds + restSeconds * millisecondsPerSecond,
    durationSeconds: restSeconds,
  };
}

export function remainingRestSeconds(state: RestTimerState, nowMilliseconds: number): number | null {
  if (state.status === 'idle') {
    return null;
  }
  if (state.status === 'paused') {
    return state.remainingSeconds;
  }
  const secondsLeft = Math.ceil((state.endsAtMilliseconds - nowMilliseconds) / millisecondsPerSecond);
  return Math.min(state.durationSeconds, Math.max(0, secondsLeft));
}

export function pausedRestTimerState(state: RestTimerState, nowMilliseconds: number): RestTimerState {
  if (state.status !== 'running') {
    return state;
  }
  return { status: 'paused', remainingSeconds: remainingRestSeconds(state, nowMilliseconds) ?? 0 };
}

export function resumedRestTimerState(state: RestTimerState, nowMilliseconds: number): RestTimerState {
  if (state.status !== 'paused') {
    return state;
  }
  return startedRestTimerState(state.remainingSeconds, nowMilliseconds);
}

export function hasRestTimerEnded(state: RestTimerState, nowMilliseconds: number): boolean {
  return state.status === 'running' && state.endsAtMilliseconds <= nowMilliseconds;
}
