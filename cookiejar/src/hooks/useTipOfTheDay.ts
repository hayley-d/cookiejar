import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { chooseGeneralTip, chooseTipOfTheDay } from '@/coach/chooseTipOfTheDay';
import { coachTipLastShownDateSettingKey } from '@/coach/coachSettingKeys';
import { getSetting, setSetting } from '@/database/repositories/appSettingsRepository';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { loadCoachSnapshot } from '@/hooks/loadCoachSnapshot';
import { durations } from '@/theme/tokens';

export function useTipOfTheDay(): string | undefined {
  const database = useSQLiteContext();
  const [tipText, setTipText] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isActive = true;
    const now = new Date();
    const today = toLocalDateString(now);
    getSetting(database, coachTipLastShownDateSettingKey)
      .then(async (lastShownDate) => {
        if (lastShownDate === today) {
          return;
        }
        const chosenTip = await loadCoachSnapshot(database, now).then(
          chooseTipOfTheDay,
          () => chooseGeneralTip(now),
        );
        if (!isActive) {
          return;
        }
        setTipText(chosenTip);
        await setSetting(database, coachTipLastShownDateSettingKey, today);
      })
      .catch(() => undefined);
    return () => {
      isActive = false;
    };
  }, [database]);

  useEffect(() => {
    if (tipText === undefined) {
      return;
    }
    const hideTimeout = setTimeout(() => setTipText(undefined), durations.tipBubbleVisible);
    return () => clearTimeout(hideTimeout);
  }, [tipText]);

  return tipText;
}
