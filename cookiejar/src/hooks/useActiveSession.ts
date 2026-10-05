import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getActiveSession } from '@/database/repositories/sessionRepository';
import { useDataVersion } from '@/stores/dataVersionStore';
import type { ActiveSession } from '@/types/ActiveSession';

export type ActiveSessionLookup =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'none' }
  | { status: 'active'; activeSession: ActiveSession };

export function useActiveSession(): ActiveSessionLookup {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const [focusCount, setFocusCount] = useState(0);
  const [lookup, setLookup] = useState<ActiveSessionLookup>({ status: 'loading' });
  const hasFocusedBefore = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedBefore.current) {
        hasFocusedBefore.current = true;
        return;
      }
      setFocusCount((previousFocusCount) => previousFocusCount + 1);
    }, []),
  );

  useEffect(() => {
    let isActive = true;
    getActiveSession(database).then(
      (activeSession) => {
        if (isActive) {
          setLookup(activeSession === null ? { status: 'none' } : { status: 'active', activeSession });
        }
      },
      () => {
        if (isActive) {
          setLookup((previousLookup) => (previousLookup.status === 'loading' ? { status: 'failed' } : previousLookup));
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [database, dataVersion, focusCount]);

  return lookup;
}
