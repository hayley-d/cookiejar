import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';

import { chooseGeneralTip, chooseTipOfTheDay } from '@/coach/chooseTipOfTheDay';
import { coachTipLastShownDateSettingKey } from '@/coach/coachSettingKeys';
import { getSetting, setSetting } from '@/database/repositories/appSettingsRepository';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { useCoachSnapshot } from '@/hooks/useCoachSnapshot';
import { durations } from '@/theme/tokens';

export function useTipOfTheDay(): string | undefined {
  const database = useSQLiteContext();
  const snapshotLookup = useCoachSnapshot();
  const [tipText, setTipText] = useState<string | undefined>(undefined);
  const hasDecided = useRef(false);

  useEffect(() => {
    if (hasDecided.current || snapshotLookup.status === 'loading') {
      return;
    }
    hasDecided.current = true;
    const now = snapshotLookup.status === 'ready' ? snapshotLookup.snapshot.now : new Date();
    const today = toLocalDateString(now);
    getSetting(database, coachTipLastShownDateSettingKey)
      .then((lastShownDate) => {
        if (lastShownDate === today) {
          return;
        }
        const chosenTip =
          snapshotLookup.status === 'ready' ? chooseTipOfTheDay(snapshotLookup.snapshot) : chooseGeneralTip(now);
        setTipText(chosenTip);
        return setSetting(database, coachTipLastShownDateSettingKey, today);
      })
      .catch(() => undefined);
  }, [database, snapshotLookup]);

  useEffect(() => {
    if (tipText === undefined) {
      return;
    }
    const hideTimeout = setTimeout(() => setTipText(undefined), durations.tipBubbleVisible);
    return () => clearTimeout(hideTimeout);
  }, [tipText]);

  return tipText;
}
