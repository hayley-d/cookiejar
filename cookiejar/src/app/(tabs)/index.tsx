import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/molecules/EmptyState';
import { HealthPermissionCard } from '@/components/molecules/HealthPermissionCard';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { StatTile } from '@/components/molecules/StatTile';
import { Box } from '@/components/primitives/Box';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { formatRestingHeartRate } from '@/health/formatRestingHeartRate';
import { formatSleepMinutes } from '@/health/formatSleepMinutes';
import { formatSteps } from '@/health/formatSteps';
import { shouldShowHealthAccessHint } from '@/health/shouldShowHealthAccessHint';
import { useDailyHealth } from '@/hooks/useDailyHealth';
import { useHealthAuthorization } from '@/hooks/useHealthAuthorization';

const coachButtonClearance = 96;
const healthAccessInstructions = 'Settings → Health → Data Access & Devices → Cookiejar → Turn On All';

const showHealthAccessInstructions = () => {
  Alert.alert('Connect Apple Health', healthAccessInstructions);
};

export default function HomeScreen() {
  const today = toLocalDateString(new Date());
  const { hasRequestedAuthorization, isRequesting, requestAuthorization } = useHealthAuthorization();
  const { snapshot, refresh } = useDailyHealth(today);

  const connectHealth = async () => {
    await requestAuthorization();
    refresh();
  };

  const shouldShowHint = shouldShowHealthAccessHint(hasRequestedAuthorization, snapshot);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <Box flex={1} background="background" style={{ paddingBottom: coachButtonClearance }}>
        <ScreenHeader title="Home" />
        <Box paddingHorizontal="medium">
          {hasRequestedAuthorization === false ? (
            <HealthPermissionCard onConnect={connectHealth} isConnecting={isRequesting} />
          ) : null}
          {hasRequestedAuthorization === true ? (
            <Box direction="row" gap="small">
              <StatTile value={formatSteps(snapshot?.steps ?? null)} label="Steps" />
              <StatTile value={formatSleepMinutes(snapshot?.sleepMinutes ?? null)} label="Sleep" />
              <StatTile value={formatRestingHeartRate(snapshot?.restingHeartRate ?? null)} label="Resting HR" />
            </Box>
          ) : null}
        </Box>
        {shouldShowHint ? (
          <EmptyState
            nuggie="tired"
            title="No data yet — check Health access"
            message="A new watch that has not synced looks the same as no access."
            actionLabel="Connect Apple Health"
            onAction={showHealthAccessInstructions}
          />
        ) : (
          <EmptyState title="Coming soon" message="Home arrives in phase 07." />
        )}
      </Box>
    </SafeAreaView>
  );
}
