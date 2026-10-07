import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getSetting, setSetting } from '@/database/repositories/appSettingsRepository';
import { AppearancePreferenceContext } from '@/theme/AppearancePreferenceContext';
import {
  appearancePreferenceSettingKey,
  parseAppearancePreference,
  type AppearancePreference,
} from '@/theme/appearancePreference';
import { applyAppearancePreference } from '@/theme/applyAppearancePreference';

type AppearancePreferenceProviderProperties = {
  children: ReactNode;
  onLoaded: () => void;
};

export function AppearancePreferenceProvider({ children, onLoaded }: AppearancePreferenceProviderProperties) {
  const database = useSQLiteContext();
  const [appearancePreference, setAppearancePreference] = useState<AppearancePreference>('system');

  useEffect(() => {
    let isActive = true;
    getSetting(database, appearancePreferenceSettingKey)
      .then((storedPreference) => {
        if (isActive) {
          const preference = parseAppearancePreference(storedPreference);
          setAppearancePreference(preference);
          applyAppearancePreference(preference);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isActive) {
          onLoaded();
        }
      });
    return () => {
      isActive = false;
    };
  }, [database, onLoaded]);

  const changeAppearancePreference = useCallback(
    (preference: AppearancePreference) => {
      setAppearancePreference(preference);
      applyAppearancePreference(preference);
      setSetting(database, appearancePreferenceSettingKey, preference).catch(() => {});
    },
    [database],
  );

  const value = useMemo(
    () => ({ appearancePreference, changeAppearancePreference }),
    [appearancePreference, changeAppearancePreference],
  );

  return <AppearancePreferenceContext.Provider value={value}>{children}</AppearancePreferenceContext.Provider>;
}
