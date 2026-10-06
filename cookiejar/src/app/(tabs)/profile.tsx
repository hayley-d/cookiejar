import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileSummaryHeader } from '@/components/molecules/ProfileSummaryHeader';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { SegmentedControl, type Segment } from '@/components/molecules/SegmentedControl';
import { SettingsRow } from '@/components/molecules/SettingsRow';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { describeHealthAccessStatus } from '@/health/describeHealthAccessStatus';
import { useHealthAuthorization } from '@/hooks/useHealthAuthorization';
import { useAppearancePreference } from '@/hooks/useAppearancePreference';
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';
import { useNewRecordCount } from '@/hooks/useNewRecordCount';
import { useProfile } from '@/hooks/useProfile';
import { useTrainingTotals } from '@/hooks/useTrainingTotals';
import { lifetimeRange } from '@/progress/currentMonthRange';
import { describeWeightSummary } from '@/progress/describeWeightSummary';
import { describeLifetimeTotals, describeNewRecordCount } from '@/progress/formatTrainingTotals';
import { summarizeWeight } from '@/progress/summarizeWeight';
import type { AppearancePreference } from '@/theme/appearancePreference';

const coachButtonClearance = 96;
const weightChangeDays = 30;

const appearanceSegments: Segment<AppearancePreference>[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

function openEditProfile() {
  router.push('/profile/edit');
}

function openAppleHealth() {
  router.push('/profile/apple-health');
}

function openMeasurements() {
  router.push('/profile/measurements');
}

function openNewMeasurement() {
  router.push('/profile/measurements/new');
}

function openProgress() {
  router.push('/progress');
}

function openNotificationSettings() {
  router.push('/notifications/settings');
}

function openExerciseLibrary() {
  router.push('/exercises');
}

export default function ProfileScreen() {
  const profile = useProfile();
  const { hasRequestedAuthorization } = useHealthAuthorization();
  const { measurements } = useBodyMeasurements();
  const { totals: lifetimeTotals } = useTrainingTotals(lifetimeRange(new Date()));
  const newRecordCount = useNewRecordCount();
  const { appearancePreference, changeAppearancePreference } = useAppearancePreference();
  const weightSummary = measurements
    ? summarizeWeight(measurements, weightChangeDays, toLocalDateString(new Date()))
    : null;
  const weightSummaryText = weightSummary
    ? describeWeightSummary(weightSummary.latestWeightKilograms, weightSummary.change, weightChangeDays)
    : null;

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
            <Typography variant="caption" color="textSecondary">
              Body
            </Typography>
            {measurements === null ? null : measurements.length === 0 ? (
              <SettingsRow title="Add your first measurement" onPress={openNewMeasurement} />
            ) : (
              <SettingsRow
                title="Body measurements"
                subtitle={weightSummaryText ?? 'No weight recorded yet'}
                onPress={openMeasurements}
              />
            )}
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Progress
            </Typography>
            {lifetimeTotals === null ? null : newRecordCount === null ? (
              <SettingsRow title={describeLifetimeTotals(lifetimeTotals)} onPress={openProgress} />
            ) : (
              <SettingsRow
                title={describeNewRecordCount(newRecordCount)}
                subtitle={describeLifetimeTotals(lifetimeTotals)}
                onPress={openProgress}
              />
            )}
          </Box>
          <Box>
            <SettingsRow title="Exercise library" onPress={openExerciseLibrary} />
            <SettingsRow
              title="Apple Health"
              subtitle={describeHealthAccessStatus(hasRequestedAuthorization).caption}
              onPress={openAppleHealth}
            />
            <SettingsRow title="Notifications" onPress={openNotificationSettings} />
          </Box>
          <Box gap="small">
            <Typography variant="caption" color="textSecondary">
              Appearance
            </Typography>
            <SegmentedControl
              segments={appearanceSegments}
              selectedValue={appearancePreference}
              onSelect={changeAppearancePreference}
            />
          </Box>
        </ScrollBox>
      </Box>
    </SafeAreaView>
  );
}
