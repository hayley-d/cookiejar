import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';

import {
  discardSession,
  getActiveSession,
  startSession as insertSession,
} from '@/database/repositories/sessionRepository';
import {
  describeSingleSessionPromptTitle,
  resolveStartAgainstActiveSession,
} from '@/sessions/resolveStartAgainstActiveSession';
import { bumpDataVersion } from '@/stores/dataVersionStore';
import { clearRestTimer } from '@/stores/restTimerStore';

export type StartSessionRequest = {
  workoutId: number;
  date: string;
  planEntryId: number | null;
};

const navigationSettleMilliseconds = 1000;

function showStartFailure() {
  Alert.alert('Could not start the workout', 'Something went wrong. Please try again.');
}

export function useStartSession() {
  const database = useSQLiteContext();
  const isStartInFlight = useRef(false);

  const releaseAfterNavigation = useCallback(() => {
    setTimeout(() => {
      isStartInFlight.current = false;
    }, navigationSettleMilliseconds);
  }, []);

  const openLogger = useCallback(
    (sessionId: number, isStarting: boolean) => {
      router.push({
        pathname: '/sessions/[sessionId]',
        params: isStarting ? { sessionId: String(sessionId), isStarting: 'true' } : { sessionId: String(sessionId) },
      });
      releaseAfterNavigation();
    },
    [releaseAfterNavigation],
  );

  const insertAndOpen = useCallback(
    async (request: StartSessionRequest) => {
      const sessionId = await insertSession(database, {
        workoutId: request.workoutId,
        scheduledDate: request.date,
        planEntryId: request.planEntryId,
      });
      bumpDataVersion();
      openLogger(sessionId, true);
    },
    [database, openLogger],
  );

  const discardAndStart = useCallback(
    async (openSessionId: number, request: StartSessionRequest) => {
      try {
        await discardSession(database, openSessionId);
        clearRestTimer();
        bumpDataVersion();
        await insertAndOpen(request);
      } catch {
        isStartInFlight.current = false;
        showStartFailure();
      }
    },
    [database, insertAndOpen],
  );

  const startSession = useCallback(
    async (request: StartSessionRequest) => {
      if (isStartInFlight.current) {
        return;
      }
      isStartInFlight.current = true;
      try {
        const activeSession = await getActiveSession(database);
        const outcome = resolveStartAgainstActiveSession(
          { workoutId: request.workoutId, scheduledDate: request.date, planEntryId: request.planEntryId },
          activeSession,
        );
        if (outcome.kind === 'resume') {
          openLogger(outcome.sessionId, false);
          return;
        }
        if (outcome.kind === 'prompt') {
          Alert.alert(
            describeSingleSessionPromptTitle(outcome.workoutName),
            undefined,
            [
              {
                text: 'Resume',
                onPress: () => openLogger(outcome.sessionId, false),
              },
              {
                text: 'Discard',
                style: 'destructive',
                onPress: () => void discardAndStart(outcome.sessionId, request),
              },
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                  isStartInFlight.current = false;
                },
              },
            ],
            {
              cancelable: true,
              onDismiss: () => {
                isStartInFlight.current = false;
              },
            },
          );
          return;
        }
        await insertAndOpen(request);
      } catch {
        isStartInFlight.current = false;
        showStartFailure();
      }
    },
    [database, discardAndStart, insertAndOpen, openLogger],
  );

  return { startSession };
}
