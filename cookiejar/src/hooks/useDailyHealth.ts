import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { getSetting } from '@/database/repositories/appSettingsRepository';
import { getHealthSnapshot, upsertHealthSnapshot } from '@/database/repositories/healthSnapshotRepository';
import { combineQueuedRunRequests, type RunRequest } from '@/health/combineQueuedRunRequests';
import { clearRefreshStarted, getLastRefreshStartedAt, markRefreshStarted } from '@/health/healthRefreshThrottle';
import { healthAuthorizationRequestedAtSettingKey } from '@/health/healthSettingKeys';
import { isHealthSnapshotFinal } from '@/health/isHealthSnapshotFinal';
import { pickNewerHealthSnapshot } from '@/health/pickNewerHealthSnapshot';
import { readDailyHealth } from '@/health/readDailyHealth';
import { shouldRefreshHealth } from '@/health/shouldRefreshHealth';
import type { HealthSnapshot } from '@/types/HealthSnapshot';

type LoadedSnapshot = {
  date: string;
  snapshot: HealthSnapshot | null;
};

export function useDailyHealth(date: string) {
  const database = useSQLiteContext();
  const [loadedSnapshot, setLoadedSnapshot] = useState<LoadedSnapshot | null>(null);
  const isMountedReference = useRef(true);
  const currentDateReference = useRef(date);
  const isRunningReference = useRef(false);
  const queuedRequestReference = useRef<RunRequest | null>(null);

  useEffect(() => {
    isMountedReference.current = true;
    return () => {
      isMountedReference.current = false;
    };
  }, []);

  useEffect(() => {
    currentDateReference.current = date;
  }, [date]);

  const requestRun = useCallback(async (request: RunRequest) => {
    if (isRunningReference.current) {
      queuedRequestReference.current = combineQueuedRunRequests(queuedRequestReference.current, request);
      return;
    }
    isRunningReference.current = true;
    try {
      let nextRequest: RunRequest | null = request;
      while (nextRequest !== null) {
        const runningRequest: RunRequest = nextRequest;
        queuedRequestReference.current = null;
        if (runningRequest.isActive()) {
          try {
            await runningRequest.execute(runningRequest.isActive);
          } catch {}
        }
        const queuedRequest = queuedRequestReference.current as RunRequest | null;
        nextRequest = queuedRequest !== null && queuedRequest.isActive() ? queuedRequest : null;
      }
    } finally {
      isRunningReference.current = false;
    }
  }, []);

  const loadAndRefresh = useCallback(
    async (isActive: () => boolean) => {
      const mergeIntoCurrentDate = (incomingSnapshot: HealthSnapshot | null, shouldStartDate: boolean) => {
        if (currentDateReference.current !== date) {
          return;
        }
        setLoadedSnapshot((previousSnapshot) => {
          if (previousSnapshot === null || previousSnapshot.date !== date) {
            return shouldStartDate ? { date, snapshot: incomingSnapshot } : previousSnapshot;
          }
          return { date, snapshot: pickNewerHealthSnapshot(previousSnapshot.snapshot, incomingSnapshot) };
        });
      };

      const cachedSnapshot = await getHealthSnapshot(database, date);
      if (!isActive()) {
        return;
      }
      mergeIntoCurrentDate(cachedSnapshot, true);

      if (cachedSnapshot !== null && isHealthSnapshotFinal(cachedSnapshot, new Date())) {
        return;
      }
      const authorizationRequestedAt = await getSetting(database, healthAuthorizationRequestedAtSettingKey);
      if (authorizationRequestedAt === null) {
        return;
      }
      const now = new Date();
      if (!shouldRefreshHealth(getLastRefreshStartedAt(date), now.getTime())) {
        return;
      }
      markRefreshStarted(date, now.getTime());

      let freshSnapshot: HealthSnapshot;
      try {
        const dailyHealth = await readDailyHealth(date, now);
        freshSnapshot = await upsertHealthSnapshot(database, dailyHealth);
      } catch {
        clearRefreshStarted(date);
        return;
      }
      if (isActive()) {
        mergeIntoCurrentDate(freshSnapshot, false);
      }
    },
    [database, date],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const isStillActive = () => isActive;
      const request: RunRequest = { isActive: isStillActive, execute: loadAndRefresh };
      requestRun(request).catch(() => {});
      const subscription = AppState.addEventListener('change', (appState) => {
        if (appState === 'active') {
          requestRun(request).catch(() => {});
        }
      });
      return () => {
        isActive = false;
        subscription.remove();
      };
    }, [loadAndRefresh, requestRun]),
  );

  const refresh = useCallback(() => {
    const isStillMounted = () => isMountedReference.current;
    requestRun({ isActive: isStillMounted, execute: loadAndRefresh }).catch(() => {});
  }, [loadAndRefresh, requestRun]);

  const isCurrentDate = loadedSnapshot !== null && loadedSnapshot.date === date;

  return {
    snapshot: isCurrentDate ? loadedSnapshot.snapshot : null,
    isLoading: !isCurrentDate,
    refresh,
  };
}
