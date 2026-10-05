import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import { loadCoachSnapshot } from '@/hooks/loadCoachSnapshot';
import { useDataVersion } from '@/stores/dataVersionStore';

export type CoachSnapshotLookup =
  { status: 'loading' } | { status: 'failed' } | { status: 'ready'; snapshot: CoachSnapshot };

export function useCoachSnapshot(): CoachSnapshotLookup {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const [lookup, setLookup] = useState<CoachSnapshotLookup>({ status: 'loading' });

  useEffect(() => {
    let isActive = true;
    loadCoachSnapshot(database, new Date()).then(
      (snapshot) => {
        if (isActive) {
          setLookup({ status: 'ready', snapshot });
        }
      },
      () => {
        if (isActive) {
          setLookup((current) => (current.status === 'ready' ? current : { status: 'failed' }));
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [database, dataVersion]);

  return lookup;
}
