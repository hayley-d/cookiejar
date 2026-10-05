import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileSummaryHeader } from '@/components/molecules/ProfileSummaryHeader';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { SettingsRow } from '@/components/molecules/SettingsRow';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { useProfile } from '@/hooks/useProfile';

const coachButtonClearance = 96;

function openEditProfile() {
  router.push('/profile/edit');
}

function openExerciseLibrary() {
  router.push('/exercises');
}

export default function ProfileScreen() {
  const profile = useProfile();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <Box flex={1} background="background">
        <ScreenHeader title="Profile" />
        <ScrollBox contentBottomPadding={coachButtonClearance}>
          <ProfileSummaryHeader
            displayName={profile.displayName}
            goal={profile.goal}
            weeklyWorkoutTarget={profile.weeklyWorkoutTarget}
            onPressEdit={openEditProfile}
          />
          <Box>
            <SettingsRow title="Exercise library" onPress={openExerciseLibrary} />
            <SettingsRow title="Apple Health" subtitle="Status and setup instructions" />
          </Box>
        </ScrollBox>
      </Box>
    </SafeAreaView>
  );
}
