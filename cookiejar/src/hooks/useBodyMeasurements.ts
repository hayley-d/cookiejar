import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

import { deleteBodyMeasurement, listBodyMeasurements } from '@/database/repositories/bodyMeasurementRepository';
import { useFocusReloadKey } from '@/hooks/useFocusReloadKey';
import { bumpDataVersion, useDataVersion } from '@/stores/dataVersionStore';
import type { BodyMeasurement } from '@/types/BodyMeasurement';

export function useBodyMeasurements() {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const focusCount = useFocusReloadKey();
  const [measurements, setMeasurements] = useState<BodyMeasurement[] | null>(null);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  useEffect(() => {
    let isActive = true;
    listBodyMeasurements(database).then(
      (loadedMeasurements) => {
        if (isActive) {
          setMeasurements(loadedMeasurements);
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

  const removeMeasurement = useCallback(
    async (bodyMeasurementId: number) => {
      await deleteBodyMeasurement(database, bodyMeasurementId);
      bumpDataVersion();
    },
    [database],
  );

  return { measurements, hasLoadFailed, removeMeasurement };
}
