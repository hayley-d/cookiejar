import {
  idleRestTimerState,
  pausedRestTimerState,
  resumedRestTimerState,
  startedRestTimerState,
  type RestTimerState,
} from '@/sessions/restTimerState';

const listeners = new Set<() => void>();
let restTimerState: RestTimerState = idleRestTimerState;

function changeState(newState: RestTimerState) {
  if (newState === restTimerState) {
    return;
  }
  restTimerState = newState;
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToRestTimer(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRestTimerState() {
  return restTimerState;
}

export function startRestTimer(restSeconds: number, nowMilliseconds: number = Date.now()) {
  changeState(startedRestTimerState(restSeconds, nowMilliseconds));
}

export function pauseRestTimer(nowMilliseconds: number = Date.now()) {
  changeState(pausedRestTimerState(restTimerState, nowMilliseconds));
}

export function resumeRestTimer(nowMilliseconds: number = Date.now()) {
  changeState(resumedRestTimerState(restTimerState, nowMilliseconds));
}

export function clearRestTimer() {
  changeState(idleRestTimerState);
}
