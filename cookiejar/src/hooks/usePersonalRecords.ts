import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { listAllFinishedSessionSets } from '@/database/repositories/progressRepository';
import { useFocusReloadKey } from '@/hooks/useFocusReloadKey';
import { buildPersonalRecordList, type PersonalRecordListItem } from '@/progress/buildPersonalRecordList';
import { useDataVersion } from '@/stores/dataVersionStore';

export function usePersonalRecords() {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const focusCount = useFocusReloadKey();
  const [personalRecords, setPersonalRecords] = useState<PersonalRecordListItem[] | null>(null);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  useEffect(() => {
    let isActive = true;
    listAllFinishedSessionSets(database)
      .then(buildPersonalRecordList)
      .then(
        (loadedRecords) => {
          if (isActive) {
            setPersonalRecords(loadedRecords);
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

  return { personalRecords, hasLoadFailed };
}
