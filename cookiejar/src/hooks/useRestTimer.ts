import * as Haptics from 'expo-haptics';
import { useEffect, useState, useSyncExternalStore } from 'react';

import { hasRestTimerEnded, remainingRestSeconds } from '@/sessions/restTimerState';
import {
  clearRestTimer,
  getRestTimerState,
  pauseRestTimer,
  resumeRestTimer,
  subscribeToRestTimer,
} from '@/stores/restTimerStore';
import { useTheme } from '@/theme/useTheme';

export function useRestTimer() {
  const theme = useTheme();
  const restTimerState = useSyncExternalStore(subscribeToRestTimer, getRestTimerState);
  const [now, setNow] = useState(() => Date.now());
  const isRunning = restTimerState.status === 'running';

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const interval = setInterval(() => {
      const currentTime = Date.now();
      if (hasRestTimerEnded(getRestTimerState(), currentTime)) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        clearRestTimer();
        return;
      }
      setNow(currentTime);
    }, theme.durations.fastTimerTick);
    return () => clearInterval(interval);
  }, [isRunning, restTimerState, theme.durations.fastTimerTick]);

  return {
    remainingSeconds: remainingRestSeconds(restTimerState, now),
    isPaused: restTimerState.status === 'paused',
    pause: () => pauseRestTimer(),
    resume: () => resumeRestTimer(),
  };
}
