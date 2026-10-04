import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/molecules/EmptyState';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { Box } from '@/components/primitives/Box';

const coachButtonClearance = 96;

export default function HomeScreen() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <Box flex={1} background="background" style={{ paddingBottom: coachButtonClearance }}>
        <ScreenHeader title="Home" />
        <EmptyState title="Coming soon" message="Home arrives in phase 07." />
      </Box>
    </SafeAreaView>
  );
}
