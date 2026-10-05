import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getProfile } from '@/database/repositories/profileRepository';
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
  const [focusCount, setFocusCount] = useState(0);
  const [profileSummary, setProfileSummary] = useState<ProfileSummary>({
    displayName: null,
    dailyStepGoal: defaultDailyStepGoal,
    weeklyWorkoutTarget: defaultWeeklyWorkoutTarget,
  });
  const hasFocusedBefore = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedBefore.current) {
        hasFocusedBefore.current = true;
        return;
      }
      setFocusCount((previousFocusCount) => previousFocusCount + 1);
    }, []),
  );

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
