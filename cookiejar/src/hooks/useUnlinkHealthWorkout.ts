import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { unlinkHealthWorkout } from '@/database/repositories/sessionRepository';
import { bumpDataVersion } from '@/stores/dataVersionStore';

export function useUnlinkHealthWorkout(sessionId: number) {
  const database = useSQLiteContext();

  return useCallback(async () => {
    await unlinkHealthWorkout(database, sessionId);
    bumpDataVersion();
  }, [database, sessionId]);
}
