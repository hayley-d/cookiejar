import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

import { getSetting, setSetting } from '@/database/repositories/appSettingsRepository';
import {
  appearancePreferenceSettingKey,
  parseAppearancePreference,
  type AppearancePreference,
} from '@/theme/appearancePreference';
import { applyAppearancePreference } from '@/theme/applyAppearancePreference';

export function useAppearancePreference() {
  const database = useSQLiteContext();
  const [appearancePreference, setAppearancePreference] = useState<AppearancePreference | null>(null);

  useEffect(() => {
    let isActive = true;
    getSetting(database, appearancePreferenceSettingKey)
      .then((storedPreference) => {
        if (isActive) {
          setAppearancePreference(parseAppearancePreference(storedPreference));
        }
      })
      .catch(() => {
        if (isActive) {
          setAppearancePreference('system');
        }
      });
    return () => {
      isActive = false;
    };
  }, [database]);

  const changeAppearancePreference = useCallback(
    (preference: AppearancePreference) => {
      setAppearancePreference(preference);
      applyAppearancePreference(preference);
      setSetting(database, appearancePreferenceSettingKey, preference).catch(() => {});
    },
    [database],
  );

  return { appearancePreference, changeAppearancePreference };
}
