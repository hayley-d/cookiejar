import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/molecules/EmptyState';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { Box } from '@/components/primitives/Box';

const coachButtonClearance = 96;

export default function CalendarScreen() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <Box flex={1} background="background" style={{ paddingBottom: coachButtonClearance }}>
        <ScreenHeader title="Calendar" />
        <EmptyState title="Coming soon" message="Calendar arrives in phase 04." />
      </Box>
    </SafeAreaView>
  );
}
