import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { type NativeScrollEvent, type NativeSyntheticEvent, useWindowDimensions } from 'react-native';

import { PageDots } from '@/components/atoms/PageDots';
import { TodayWorkoutCard } from '@/components/molecules/TodayWorkoutCard';
import { Box } from '@/components/primitives/Box';
import { SnapList } from '@/components/primitives/SnapList';
import { Typography } from '@/components/primitives/Typography';
import { carouselPageIndex } from '@/home/carouselPageIndex';
import { resolveScheduledWorkoutRoute } from '@/sessions/resolveScheduledWorkoutRoute';
import { useTheme } from '@/theme/useTheme';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

type TodayCarouselProperties = {
  scheduledWorkouts: ScheduledWorkout[];
  onStartWorkout: (scheduledWorkout: ScheduledWorkout) => void;
};

function openWorkout(scheduledWorkout: ScheduledWorkout) {
  const route = resolveScheduledWorkoutRoute(scheduledWorkout);
  if (route === null) {
    return;
  }
  router.push(route);
}

function workoutKey(scheduledWorkout: ScheduledWorkout) {
  return `${scheduledWorkout.planEntryId ?? 'unplanned'}-${scheduledWorkout.sessionId ?? 'none'}`;
}

export function TodayCarousel({ scheduledWorkouts, onStartWorkout }: TodayCarouselProperties) {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const cardWidth = Math.round(screenWidth * theme.sizes.todayCardWidthRatio);
  const gap = theme.spacing.medium;
  const snapInterval = cardWidth + gap;

  const trackActiveIndex = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setActiveIndex(
        carouselPageIndex({
          offsetX: event.nativeEvent.contentOffset.x,
          snapInterval,
          pageCount: scheduledWorkouts.length,
        }),
      );
    },
    [snapInterval, scheduledWorkouts.length],
  );

  if (scheduledWorkouts.length === 0) {
    return null;
  }

  return (
    <Box gap="small">
      <Box direction="row" align="center" justify="space-between">
        <Typography variant="label" color="textSecondary" accessibilityRole="header">
          {"TODAY'S WORKOUTS"}
        </Typography>
        <Typography variant="label" color="textSecondary">
          {scheduledWorkouts.length}
        </Typography>
      </Box>
      <Box style={{ marginHorizontal: -theme.spacing.medium }}>
        <SnapList
          data={scheduledWorkouts}
          snapInterval={snapInterval}
          keyExtractor={workoutKey}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.medium, gap, paddingVertical: theme.spacing.small }}
          onScroll={trackActiveIndex}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <TodayWorkoutCard
              scheduledWorkout={item}
              width={cardWidth}
              onPress={() => openWorkout(item)}
              onStart={() => onStartWorkout(item)}
            />
          )}
        />
      </Box>
      {scheduledWorkouts.length > 1 ? (
        <PageDots count={scheduledWorkouts.length} activeIndex={Math.min(activeIndex, scheduledWorkouts.length - 1)} />
      ) : null}
    </Box>
  );
}
