import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { listClassStatistics } from '@/database/repositories/progressRepository';
import { useFocusReloadKey } from '@/hooks/useFocusReloadKey';
import { currentMonthRange } from '@/progress/currentMonthRange';
import { useDataVersion } from '@/stores/dataVersionStore';
import type { ClassStatistics } from '@/types/ClassStatistics';

export function useClassStatistics() {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const focusCount = useFocusReloadKey();
  const [classStatistics, setClassStatistics] = useState<ClassStatistics[] | null>(null);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  useEffect(() => {
    let isActive = true;
    listClassStatistics(database, currentMonthRange(new Date())).then(
      (loadedStatistics) => {
        if (isActive) {
          setClassStatistics(loadedStatistics);
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

  return { classStatistics, hasLoadFailed };
}
