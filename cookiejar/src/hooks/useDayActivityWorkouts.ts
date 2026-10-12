import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { getSetting } from '@/database/repositories/appSettingsRepository';
import type { HealthWorkout } from '@/health/HealthTypes';
import { healthAuthorizationRequestedAtSettingKey } from '@/health/healthSettingKeys';
import { readDayActivityWorkouts } from '@/health/readDayActivityWorkouts';

type DayActivityWorkoutsLookup = { date: string; workouts: HealthWorkout[] };

export function useDayActivityWorkouts(date: string): HealthWorkout[] {
  const database = useSQLiteContext();
  const [lookup, setLookup] = useState<DayActivityWorkoutsLookup | null>(null);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      let workouts: HealthWorkout[] = [];
      try {
        const authorizationRequestedAt = await getSetting(database, healthAuthorizationRequestedAtSettingKey);
        if (authorizationRequestedAt !== null) {
          workouts = await readDayActivityWorkouts(date);
        }
      } catch {
        workouts = [];
      }
      if (isActive) {
        setLookup({ date, workouts });
      }
    };
    load().catch(() => {});
    return () => {
      isActive = false;
    };
  }, [database, date]);

  return lookup !== null && lookup.date === date ? lookup.workouts : [];
}
