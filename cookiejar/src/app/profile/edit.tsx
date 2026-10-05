import { router, Stack } from 'expo-router';

import { TextButton } from '@/components/atoms/TextButton';
import { ProfileForm } from '@/components/organisms/ProfileForm';
import { useProfile } from '@/hooks/useProfile';
import { useProfileForm } from '@/hooks/useProfileForm';
import { snapStepGoal } from '@/profile/profileFormRules';
import type { ProfileFormValues } from '@/profile/validateProfileForm';

type LoadedProfileFormProperties = {
  initialValues: ProfileFormValues;
};

function LoadedProfileForm({ initialValues }: LoadedProfileFormProperties) {
  const profileForm = useProfileForm({ initialValues, onSaved: () => router.back() });

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <TextButton label="Save" onPress={profileForm.save} disabled={profileForm.isSaving} />,
        }}
      />
      <ProfileForm values={profileForm.values} errors={profileForm.errors} onChangeValues={profileForm.changeValues} />
    </>
  );
}

export default function EditProfileScreen() {
  const profile = useProfile();

  if (!profile.isLoaded) {
    return null;
  }

  return (
    <LoadedProfileForm
      initialValues={{
        displayName: profile.displayName ?? '',
        birthDate: profile.birthDate,
        sex: profile.sex,
        heightCentimetres: profile.heightCentimetres,
        goal: profile.goal,
        weeklyWorkoutTarget: profile.weeklyWorkoutTarget,
        dailyStepGoal: snapStepGoal(profile.dailyStepGoal),
      }}
    />
  );
}
