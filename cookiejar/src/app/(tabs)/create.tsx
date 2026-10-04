import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/Button';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { Box } from '@/components/primitives/Box';

const coachButtonClearance = 96;

export default function CreateScreen() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <Box flex={1} background="background" style={{ paddingBottom: coachButtonClearance }}>
        <ScreenHeader title="Create" />
        <Box paddingHorizontal="medium">
          <Button label="Exercise library" variant="secondary" onPress={() => router.push('/exercises')} />
        </Box>
        <EmptyState title="Coming soon" message="Create arrives in phase 02." />
      </Box>
    </SafeAreaView>
  );
}
