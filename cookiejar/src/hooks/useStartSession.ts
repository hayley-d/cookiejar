import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';

import { startSession as insertSession } from '@/database/repositories/sessionRepository';
import { bumpDataVersion } from '@/stores/dataVersionStore';

export type StartSessionRequest = {
  workoutId: number;
  date: string;
  planEntryId: number | null;
};

export function useStartSession() {
  const database = useSQLiteContext();
  const isStartInFlight = useRef(false);

  const startSession = useCallback(
    async (request: StartSessionRequest) => {
      if (isStartInFlight.current) {
        return;
      }
      isStartInFlight.current = true;
      try {
        const sessionId = await insertSession(database, {
          workoutId: request.workoutId,
          scheduledDate: request.date,
          planEntryId: request.planEntryId,
        });
        bumpDataVersion();
        router.push({
          pathname: '/sessions/[sessionId]',
          params: { sessionId: String(sessionId), isStarting: 'true' },
        });
      } catch {
        Alert.alert('Could not start the workout', 'Something went wrong. Please try again.');
      } finally {
        isStartInFlight.current = false;
      }
    },
    [database],
  );

  return { startSession };
}
