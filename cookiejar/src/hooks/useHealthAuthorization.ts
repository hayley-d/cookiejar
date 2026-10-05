import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { getSetting, setSetting } from '@/database/repositories/appSettingsRepository';
import { requestHealthAuthorization } from '@/health/healthAuthorization';
import type { HealthAuthorizationOutcome } from '@/health/HealthTypes';
import { healthAuthorizationRequestedAtSettingKey } from '@/health/healthSettingKeys';

export function useHealthAuthorization() {
  const database = useSQLiteContext();
  const [requestedAt, setRequestedAt] = useState<string | null | undefined>(undefined);
  const [isRequesting, setIsRequesting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      getSetting(database, healthAuthorizationRequestedAtSettingKey).then(
        (storedRequestedAt) => {
          if (isActive) {
            setRequestedAt(storedRequestedAt);
          }
        },
        () => {},
      );
      return () => {
        isActive = false;
      };
    }, [database]),
  );

  const requestAuthorization = useCallback(async (): Promise<HealthAuthorizationOutcome> => {
    setIsRequesting(true);
    const outcome = await requestHealthAuthorization();
    if (outcome !== 'unavailable') {
      const newRequestedAt = new Date().toISOString();
      await setSetting(database, healthAuthorizationRequestedAtSettingKey, newRequestedAt).catch(() => {});
      setRequestedAt(newRequestedAt);
    }
    setIsRequesting(false);
    return outcome;
  }, [database]);

  return {
    hasRequestedAuthorization: requestedAt === undefined ? null : requestedAt !== null,
    isRequesting,
    requestAuthorization,
  };
}
