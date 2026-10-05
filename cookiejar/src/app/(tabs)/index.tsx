import { requestAuthorization } from '@kingstinct/react-native-healthkit';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/Button';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { Box } from '@/components/primitives/Box';

const coachButtonClearance = 96;

const requestHealthReadAccess = () =>
  requestAuthorization({
    toRead: [
      'HKQuantityTypeIdentifierStepCount',
      'HKCategoryTypeIdentifierSleepAnalysis',
      'HKQuantityTypeIdentifierRestingHeartRate',
      'HKQuantityTypeIdentifierHeartRate',
      'HKWorkoutTypeIdentifier',
    ],
  });

export default function HomeScreen() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <Box flex={1} background="background" style={{ paddingBottom: coachButtonClearance }}>
        <ScreenHeader title="Home" />
        <EmptyState title="Coming soon" message="Home arrives in phase 07." />
        <Button label="Request Health access" onPress={requestHealthReadAccess} />
      </Box>
    </SafeAreaView>
  );
}
