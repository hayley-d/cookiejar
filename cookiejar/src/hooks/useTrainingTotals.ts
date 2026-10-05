import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { getTrainingTotals } from '@/database/repositories/progressRepository';
import { useFocusReloadKey } from '@/hooks/useFocusReloadKey';
import { useDataVersion } from '@/stores/dataVersionStore';
import type { TrainingTotals, TrainingTotalsRange } from '@/types/TrainingTotals';

export function useTrainingTotals(range: TrainingTotalsRange) {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const focusCount = useFocusReloadKey();
  const [totals, setTotals] = useState<TrainingTotals | null>(null);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);
  const { startDate, endDate } = range;

  useEffect(() => {
    let isActive = true;
    getTrainingTotals(database, startDate, endDate).then(
      (loadedTotals) => {
        if (isActive) {
          setTotals(loadedTotals);
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
  }, [database, dataVersion, focusCount, startDate, endDate]);

  return { totals, hasLoadFailed };
}
