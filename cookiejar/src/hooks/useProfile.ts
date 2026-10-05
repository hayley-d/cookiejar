import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { getProfile } from '@/database/repositories/profileRepository';
import { useFocusReloadKey } from '@/hooks/useFocusReloadKey';
import { useDataVersion } from '@/stores/dataVersionStore';
import type { Profile } from '@/types/Profile';

export type ProfileState = Profile & {
  isLoaded: boolean;
};

const defaultProfileState: ProfileState = {
  id: 1,
  displayName: null,
  birthDate: null,
  sex: null,
  heightCentimetres: null,
  goal: null,
  weeklyWorkoutTarget: 4,
  dailyStepGoal: 10000,
  updatedAt: '',
  isLoaded: false,
};

export function useProfile(): ProfileState {
  const database = useSQLiteContext();
  const dataVersion = useDataVersion();
  const focusCount = useFocusReloadKey();
  const [profileState, setProfileState] = useState<ProfileState>(defaultProfileState);

  useEffect(() => {
    let isActive = true;
    getProfile(database).then(
      (profile) => {
        if (isActive && profile) {
          setProfileState({ ...profile, isLoaded: true });
        }
      },
      () => {},
    );
    return () => {
      isActive = false;
    };
  }, [database, dataVersion, focusCount]);

  return profileState;
}
