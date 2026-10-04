import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/molecules/EmptyState';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { Box } from '@/components/primitives/Box';

const coachButtonClearance = 96;

export default function ProfileScreen() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <Box flex={1} background="background" style={{ paddingBottom: coachButtonClearance }}>
        <ScreenHeader title="Profile" />
        <EmptyState title="Coming soon" message="Profile arrives in phase 08." />
      </Box>
    </SafeAreaView>
  );
}
