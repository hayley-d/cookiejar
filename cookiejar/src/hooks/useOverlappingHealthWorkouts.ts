import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getSetting } from '@/database/repositories/appSettingsRepository';
import { getSessionWithExercises, linkHealthWorkout } from '@/database/repositories/sessionRepository';
import { groupHealthWorkouts, type GroupedHealthWorkouts } from '@/health/groupHealthWorkouts';
import { healthAuthorizationRequestedAtSettingKey } from '@/health/healthSettingKeys';
import type { HealthWorkout } from '@/health/HealthTypes';
import { healthWorkoutSearchWindow } from '@/health/healthWorkoutSearchWindow';
import { findOverlappingWorkouts, readWorkoutHeartRate } from '@/health/readHealthWorkouts';
import { bumpDataVersion } from '@/stores/dataVersionStore';

export type OverlappingHealthWorkoutsLookup =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'failed' }
  | { status: 'ready'; groupedWorkouts: GroupedHealthWorkouts };

export function useOverlappingHealthWorkouts(sessionId: number) {
  const database = useSQLiteContext();
  const [lookup, setLookup] = useState<OverlappingHealthWorkoutsLookup>({ status: 'loading' });
  const [isLinking, setIsLinking] = useState(false);
  const isMountedReference = useRef(true);
  const isLinkInFlight = useRef(false);

  useEffect(() => {
    isMountedReference.current = true;
    return () => {
      isMountedReference.current = false;
    };
  }, []);

  const load = useCallback(
    async (isActive: () => boolean) => {
      let nextLookup: OverlappingHealthWorkoutsLookup;
      try {
        const authorizationRequestedAt = await getSetting(database, healthAuthorizationRequestedAtSettingKey);
        const session = await getSessionWithExercises(database, sessionId);
        if (authorizationRequestedAt === null) {
          nextLookup = { status: 'unavailable' };
        } else if (session === null) {
          nextLookup = { status: 'failed' };
        } else {
          const { startDate, endDate } = healthWorkoutSearchWindow(session.startedAt, session.finishedAt, new Date());
          const workouts = await findOverlappingWorkouts(startDate, endDate);
          nextLookup = { status: 'ready', groupedWorkouts: groupHealthWorkouts(workouts) };
        }
      } catch {
        nextLookup = { status: 'failed' };
      }
      if (isActive()) {
        setLookup(nextLookup);
      }
    },
    [database, sessionId],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      load(() => isActive).catch(() => {});
      return () => {
        isActive = false;
      };
    }, [load]),
  );

  const refresh = useCallback(() => {
    setLookup({ status: 'loading' });
    load(() => isMountedReference.current).catch(() => {});
  }, [load]);

  const link = useCallback(
    async (workout: HealthWorkout): Promise<boolean> => {
      if (isLinkInFlight.current) {
        return false;
      }
      isLinkInFlight.current = true;
      setIsLinking(true);
      try {
        const heartRate = await readWorkoutHeartRate(workout.startDate, workout.endDate).catch(() => ({
          averageHeartRate: null,
          maximumHeartRate: null,
        }));
        await linkHealthWorkout(database, sessionId, {
          healthWorkoutUuid: workout.uuid,
          healthAverageHeartRate: heartRate.averageHeartRate,
          healthMaximumHeartRate: heartRate.maximumHeartRate,
          healthActiveKilocalories: workout.activeKilocalories,
          healthDurationSeconds: workout.durationSeconds,
        });
        bumpDataVersion();
        return true;
      } catch {
        return false;
      } finally {
        isLinkInFlight.current = false;
        if (isMountedReference.current) {
          setIsLinking(false);
        }
      }
    },
    [database, sessionId],
  );

  return { lookup, refresh, link, isLinking };
}
