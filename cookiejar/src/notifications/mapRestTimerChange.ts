import { remainingRestSeconds, type RestTimerState } from '@/sessions/restTimerState';

export type RestAlertAction = { kind: 'schedule'; seconds: number } | { kind: 'cancel' } | { kind: 'nothing' };

const minimumAlertSeconds = 1;

export function mapRestTimerChange(
  previousState: RestTimerState,
  nextState: RestTimerState,
  nowMilliseconds: number,
): RestAlertAction {
  if (nextState.status === 'running') {
    const secondsLeft = remainingRestSeconds(nextState, nowMilliseconds) ?? 0;
    return secondsLeft >= minimumAlertSeconds ? { kind: 'schedule', seconds: secondsLeft } : { kind: 'cancel' };
  }
  if (previousState.status === 'idle' && nextState.status === 'idle') {
    return { kind: 'nothing' };
  }
  return { kind: 'cancel' };
}
