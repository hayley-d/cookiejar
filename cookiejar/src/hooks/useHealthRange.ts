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
import { mergeHealthSnapshots } from '@/health/mergeHealthSnapshots';
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
      const mergeIntoCurrentRange = (incomingSnapshots: HealthSnapshot[], shouldStartRange: boolean) => {
        setLoadedRange((previousRange) => {
          const isSameRange =
            previousRange !== null && previousRange.startDate === startDate && previousRange.endDate === endDate;
          if (!isSameRange) {
            return shouldStartRange
              ? { startDate, endDate, snapshotsByDate: mergeHealthSnapshots(new Map(), incomingSnapshots) }
              : previousRange;
          }
          return {
            startDate,
            endDate,
            snapshotsByDate: mergeHealthSnapshots(previousRange.snapshotsByDate, incomingSnapshots),
          };
        });
      };

      const cachedSnapshots = await getHealthSnapshotsBetween(database, startDate, endDate);
      if (!isActive()) {
        return;
      }
      mergeIntoCurrentRange(cachedSnapshots, true);

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
          mergeIntoCurrentRange([freshSnapshot], false);
        } catch {
          clearRefreshStarted(date);
        }
      }
    },
    [database, startDate, endDate],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      let isRunning = false;
      let isRerunQueued = false;
      const isStillActive = () => isActive;
      const requestRun = async () => {
        if (isRunning) {
          isRerunQueued = true;
          return;
        }
        isRunning = true;
        try {
          do {
            isRerunQueued = false;
            await loadAndBackfill(isStillActive);
          } while (isRerunQueued && isActive);
        } finally {
          isRunning = false;
        }
      };
      requestRun().catch(() => {});
      const subscription = AppState.addEventListener('change', (appState) => {
        if (appState === 'active') {
          requestRun().catch(() => {});
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
