import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { listFinishedActivityLogs } from '@/database/repositories/progressRepository';
import { useFocusReloadKey } from '@/hooks/useFocusReloadKey';
import { buildActivityStatistics } from '@/progress/buildActivityStatistics';
import { useDataVersion } from '@/stores/dataVersionStore';
import type { ActivityStatistics } from '@/types/ActivityStatistics';

export function useActivityStatistics() {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const focusCount = useFocusReloadKey();
  const [activityStatistics, setActivityStatistics] = useState<ActivityStatistics[] | null>(null);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  useEffect(() => {
    let isActive = true;
    listFinishedActivityLogs(database).then(
      (activityLogs) => {
        if (isActive) {
          setActivityStatistics(buildActivityStatistics(activityLogs, new Date()));
          setHasLoadFailed(false);
        }
      },
      () => {
        if (isActive) {
          setHasLoadFailed(true);
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [database, dataVersion, focusCount]);

  return { activityStatistics, hasLoadFailed };
}
