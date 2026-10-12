import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { listFinishedSwimLogs } from '@/database/repositories/progressRepository';
import { useFocusReloadKey } from '@/hooks/useFocusReloadKey';
import { buildSwimStatistics } from '@/progress/buildSwimStatistics';
import { useDataVersion } from '@/stores/dataVersionStore';
import type { SwimStatistics } from '@/types/SwimStatistics';

export function useSwimStatistics() {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const focusCount = useFocusReloadKey();
  const [swimStatistics, setSwimStatistics] = useState<SwimStatistics | null>(null);

  useEffect(() => {
    let isActive = true;
    listFinishedSwimLogs(database).then(
      (swimLogs) => {
        if (isActive) {
          setSwimStatistics(buildSwimStatistics(swimLogs, new Date()));
        }
      },
      () => {},
    );
    return () => {
      isActive = false;
    };
  }, [database, dataVersion, focusCount]);

  return { swimStatistics };
}
