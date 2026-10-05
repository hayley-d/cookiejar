import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { getProfile } from '@/database/repositories/profileRepository';
import { useFocusReloadKey } from '@/hooks/useFocusReloadKey';
import { useDataVersion } from '@/stores/dataVersionStore';

export type ProfileSummary = {
  displayName: string | null;
  dailyStepGoal: number;
  weeklyWorkoutTarget: number;
};

const defaultDailyStepGoal = 10000;
const defaultWeeklyWorkoutTarget = 4;

export function useProfile(): ProfileSummary {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const focusCount = useFocusReloadKey();
  const [profileSummary, setProfileSummary] = useState<ProfileSummary>({
    displayName: null,
    dailyStepGoal: defaultDailyStepGoal,
    weeklyWorkoutTarget: defaultWeeklyWorkoutTarget,
  });

  useEffect(() => {
    let isActive = true;
    getProfile(database).then(
      (profile) => {
        if (isActive && profile) {
          setProfileSummary({
            displayName: profile.displayName,
            dailyStepGoal: profile.dailyStepGoal,
            weeklyWorkoutTarget: profile.weeklyWorkoutTarget,
          });
        }
      },
      () => {},
    );
    return () => {
      isActive = false;
    };
  }, [database, dataVersion, focusCount]);

  return profileSummary;
}
