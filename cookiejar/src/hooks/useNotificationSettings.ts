import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';

import { setSetting } from '@/database/repositories/appSettingsRepository';
import { loadNotificationSettings } from '@/hooks/loadNotificationSettings';
import { encodeNotificationSettings } from '@/notifications/encodeNotificationSettings';
import { cancelRestTimerNotification } from '@/notifications/notificationScheduling';
import { notificationSettingKeys } from '@/notifications/notificationSettingKeys';
import type { NotificationSettings } from '@/notifications/NotificationSettings';
import { reportNotificationError } from '@/notifications/reportNotificationError';
import { bumpDataVersion } from '@/stores/dataVersionStore';

export function useNotificationSettings() {
  const database = useSQLiteContext();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const settingsReference = useRef<NotificationSettings | null>(null);

  const applySettings = useCallback((nextSettings: NotificationSettings) => {
    settingsReference.current = nextSettings;
    setSettings(nextSettings);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      loadNotificationSettings(database).then((loadedSettings) => {
        if (isActive) {
          applySettings(loadedSettings);
        }
      }, reportNotificationError);
      return () => {
        isActive = false;
      };
    }, [database, applySettings]),
  );

  const updateSettings = useCallback(
    async (changes: Partial<NotificationSettings>) => {
      const previousSettings = settingsReference.current;
      if (previousSettings === null) {
        return;
      }
      const nextSettings = { ...previousSettings, ...changes };
      const previousEncoded = encodeNotificationSettings(previousSettings);
      const nextEncoded = encodeNotificationSettings(nextSettings);
      applySettings(nextSettings);
      try {
        for (const key of notificationSettingKeys) {
          if (nextEncoded[key] !== previousEncoded[key]) {
            await setSetting(database, key, nextEncoded[key]);
          }
        }
      } catch (error) {
        const revertedChanges: Partial<NotificationSettings> = {};
        for (const changedKey of Object.keys(changes) as (keyof NotificationSettings)[]) {
          Object.assign(revertedChanges, { [changedKey]: previousSettings[changedKey] });
        }
        applySettings({ ...(settingsReference.current ?? previousSettings), ...revertedChanges });
        reportNotificationError(error);
      }
      if (changes.areRestAlertsEnabled === false) {
        await cancelRestTimerNotification().catch(reportNotificationError);
      }
      bumpDataVersion();
    },
    [database, applySettings],
  );

  return { settings, updateSettings };
}
