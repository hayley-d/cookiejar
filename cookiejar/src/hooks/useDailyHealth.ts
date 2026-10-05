import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { getSetting } from '@/database/repositories/appSettingsRepository';
import { getHealthSnapshot, upsertHealthSnapshot } from '@/database/repositories/healthSnapshotRepository';
import { healthAuthorizationRequestedAtSettingKey } from '@/health/healthSettingKeys';
import { isHealthSnapshotFinal } from '@/health/isHealthSnapshotFinal';
import { readDailyHealth } from '@/health/readDailyHealth';
import { shouldRefreshHealth } from '@/health/shouldRefreshHealth';
import type { HealthSnapshot } from '@/types/HealthSnapshot';

const lastRefreshStartedAtByDate = new Map<string, number>();

type LoadedSnapshot = {
  date: string;
  snapshot: HealthSnapshot | null;
};

export function useDailyHealth(date: string) {
  const database = useSQLiteContext();
  const [loadedSnapshot, setLoadedSnapshot] = useState<LoadedSnapshot | null>(null);
  const isMountedReference = useRef(true);

  useEffect(() => {
    isMountedReference.current = true;
    return () => {
      isMountedReference.current = false;
    };
  }, []);

  const loadAndRefresh = useCallback(
    async (isActive: () => boolean) => {
      const cachedSnapshot = await getHealthSnapshot(database, date);
      if (!isActive()) {
        return;
      }
      setLoadedSnapshot({ date, snapshot: cachedSnapshot });

      if (cachedSnapshot !== null && isHealthSnapshotFinal(cachedSnapshot, new Date())) {
        return;
      }
      const authorizationRequestedAt = await getSetting(database, healthAuthorizationRequestedAtSettingKey);
      if (authorizationRequestedAt === null) {
        return;
      }
      const now = new Date();
      if (!shouldRefreshHealth(lastRefreshStartedAtByDate.get(date) ?? null, now.getTime())) {
        return;
      }
      lastRefreshStartedAtByDate.set(date, now.getTime());

      let freshSnapshot: HealthSnapshot;
      try {
        const dailyHealth = await readDailyHealth(date, now);
        freshSnapshot = await upsertHealthSnapshot(database, dailyHealth);
      } catch {
        lastRefreshStartedAtByDate.delete(date);
        return;
      }
      if (isActive()) {
        setLoadedSnapshot({ date, snapshot: freshSnapshot });
      }
    },
    [database, date],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const isStillActive = () => isActive;
      loadAndRefresh(isStillActive).catch(() => {});
      const subscription = AppState.addEventListener('change', (appState) => {
        if (appState === 'active') {
          loadAndRefresh(isStillActive).catch(() => {});
        }
      });
      return () => {
        isActive = false;
        subscription.remove();
      };
    }, [loadAndRefresh]),
  );

  const refresh = useCallback(() => {
    loadAndRefresh(() => isMountedReference.current).catch(() => {});
  }, [loadAndRefresh]);

  const isCurrentDate = loadedSnapshot !== null && loadedSnapshot.date === date;

  return {
    snapshot: isCurrentDate ? loadedSnapshot.snapshot : null,
    isLoading: !isCurrentDate,
    refresh,
  };
}
