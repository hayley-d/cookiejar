import { router, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';

import { LinkHealthWorkoutSheet } from '@/components/organisms/LinkHealthWorkoutSheet';
import { useOverlappingHealthWorkouts } from '@/hooks/useOverlappingHealthWorkouts';
import type { HealthWorkout } from '@/health/HealthTypes';

type LinkHealthWorkoutParameters = {
  sessionId: string;
};

export default function LinkHealthWorkoutScreen() {
  const { sessionId: sessionIdParameter } = useLocalSearchParams<LinkHealthWorkoutParameters>();
  const { lookup, refresh, link, isLinking } = useOverlappingHealthWorkouts(Number(sessionIdParameter));

  const pickWorkout = async (workout: HealthWorkout) => {
    const wasLinked = await link(workout);
    if (wasLinked) {
      router.back();
    } else {
      Alert.alert('Could not link the workout', 'Something went wrong. Please try again.');
    }
  };

  return (
    <LinkHealthWorkoutSheet
      isLoading={lookup.status === 'loading'}
      groupedWorkouts={lookup.status === 'ready' ? lookup.groupedWorkouts : null}
      isLinking={isLinking}
      onPickWorkout={pickWorkout}
      onRefresh={refresh}
    />
  );
}
