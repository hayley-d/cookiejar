import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { AppState } from 'react-native';

import { getSetting } from '@/database/repositories/appSettingsRepository';
import { getHealthSnapshotsBetween, upsertHealthSnapshot } from '@/database/repositories/healthSnapshotRepository';
import { datesBetween } from '@/dates/datesBetween';
import { clearRefreshStarted, getLastRefreshStartedAt, markRefreshStarted } from '@/health/healthRefreshThrottle';
import { healthAuthorizationRequestedAtSettingKey } from '@/health/healthSettingKeys';
import { healthRangeDatesToBackfill } from '@/health/healthRangeDatesToBackfill';
import { readDailyHealth } from '@/health/readDailyHealth';
import { shouldRefreshHealth } from '@/health/shouldRefreshHealth';
import type { HealthSnapshot } from '@/types/HealthSnapshot';

type LoadedRange = {
  startDate: string;
  endDate: string;
  snapshotsByDate: Map<string, HealthSnapshot>;
};

const emptySnapshotsByDate = new Map<string, HealthSnapshot>();

export function useHealthRange(startDate: string, endDate: string) {
  const database = useSQLiteContext();
  const [loadedRange, setLoadedRange] = useState<LoadedRange | null>(null);

  const loadAndBackfill = useCallback(
    async (isActive: () => boolean) => {
      const cachedSnapshots = await getHealthSnapshotsBetween(database, startDate, endDate);
      if (!isActive()) {
        return;
      }
      const snapshotsByDate = new Map(cachedSnapshots.map((snapshot) => [snapshot.date, snapshot]));
      setLoadedRange({ startDate, endDate, snapshotsByDate: new Map(snapshotsByDate) });

      const authorizationRequestedAt = await getSetting(database, healthAuthorizationRequestedAtSettingKey);
      if (!isActive() || authorizationRequestedAt === null) {
        return;
      }
      const datesToBackfill = healthRangeDatesToBackfill(datesBetween(startDate, endDate), cachedSnapshots, new Date());

      for (const date of datesToBackfill) {
        if (!isActive()) {
          return;
        }
        const now = new Date();
        if (!shouldRefreshHealth(getLastRefreshStartedAt(date), now.getTime())) {
          continue;
        }
        markRefreshStarted(date, now.getTime());
        try {
          const dailyHealth = await readDailyHealth(date, now);
          const freshSnapshot = await upsertHealthSnapshot(database, dailyHealth);
          snapshotsByDate.set(date, freshSnapshot);
        } catch {
          clearRefreshStarted(date);
          continue;
        }
        if (isActive()) {
          setLoadedRange({ startDate, endDate, snapshotsByDate: new Map(snapshotsByDate) });
        }
      }
    },
    [database, startDate, endDate],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const isStillActive = () => isActive;
      loadAndBackfill(isStillActive).catch(() => {});
      const subscription = AppState.addEventListener('change', (appState) => {
        if (appState === 'active') {
          loadAndBackfill(isStillActive).catch(() => {});
        }
      });
      return () => {
        isActive = false;
        subscription.remove();
      };
    }, [loadAndBackfill]),
  );

  const isCurrentRange = loadedRange !== null && loadedRange.startDate === startDate && loadedRange.endDate === endDate;

  return {
    snapshotsByDate: isCurrentRange ? loadedRange.snapshotsByDate : emptySnapshotsByDate,
    isLoading: !isCurrentRange,
  };
}
