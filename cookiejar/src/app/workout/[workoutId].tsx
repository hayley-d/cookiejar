import { useLocalSearchParams } from 'expo-router';

import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';

export default function WorkoutDetailScreen() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string; date?: string; planEntryId?: string }>();

  return (
    <Box flex={1} background="background" padding="medium">
      <Typography>Workout {workoutId}</Typography>
    </Box>
  );
}
