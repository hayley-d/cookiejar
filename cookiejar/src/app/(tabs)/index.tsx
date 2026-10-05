import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/molecules/EmptyState';
import { HealthPermissionCard } from '@/components/molecules/HealthPermissionCard';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { StatTile } from '@/components/molecules/StatTile';
import { Box } from '@/components/primitives/Box';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { formatSteps } from '@/health/formatSteps';
import { useDailyHealth } from '@/hooks/useDailyHealth';
import { useHealthAuthorization } from '@/hooks/useHealthAuthorization';

const coachButtonClearance = 96;

export default function HomeScreen() {
  const today = toLocalDateString(new Date());
  const { hasRequestedAuthorization, isRequesting, requestAuthorization } = useHealthAuthorization();
  const { snapshot, refresh } = useDailyHealth(today);

  const connectHealth = async () => {
    await requestAuthorization();
    refresh();
  };

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
            </Box>
          ) : null}
        </Box>
        <EmptyState title="Coming soon" message="Home arrives in phase 07." />
      </Box>
    </SafeAreaView>
  );
}
