import { useState } from 'react';

import { Card } from '@/components/atoms/Card';
import { IconButton } from '@/components/atoms/IconButton';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { StatusChip } from '@/components/atoms/StatusChip';
import { Box } from '@/components/primitives/Box';
import { Image } from '@/components/primitives/Image';
import { Stack } from '@/components/primitives/Stack';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';
import {
  describeScheduledWorkoutKind,
  describeScheduledWorkoutSummary,
} from '@/workouts/describeScheduledWorkout';
import { workoutNuggie } from '@/workouts/workoutNuggie';

type ScheduledWorkoutCardProperties = {
  scheduledWorkout: ScheduledWorkout;
  today: string;
  onPress: () => void;
  onStart: () => void;
};

export function ScheduledWorkoutCard({ scheduledWorkout, today, onPress, onStart }: ScheduledWorkoutCardProperties) {
  const theme = useTheme();
  const { workout } = scheduledWorkout;
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageUrl = workout.imageUrl;
  const showsImage = imageUrl !== null && imageUrl !== failedImageUrl;
  const kindText = describeScheduledWorkoutKind(scheduledWorkout);
  const summary = describeScheduledWorkoutSummary(scheduledWorkout);
  const canStart = scheduledWorkout.status === 'planned' && scheduledWorkout.date <= today && workout.id !== null;
  const isTappable = workout.id !== null;

  return (
    <Touchable
      onPress={onPress}
      disabled={!isTappable}
      accessibilityLabel={summary === null ? `${kindText}, ${workout.name}` : `${kindText}, ${workout.name}, ${summary}`}
    >
      <Card padding="small">
        <Stack direction="horizontal" gap="medium" align="center">
          {showsImage ? (
            <Image
              source={{ uri: imageUrl }}
              contentFit="cover"
              style={{
                width: theme.sizes.workoutRowImage,
                height: theme.sizes.workoutRowImage,
                borderRadius: theme.radii.medium,
              }}
              onError={() => setFailedImageUrl(imageUrl)}
            />
          ) : (
            <NuggieImage name={workoutNuggie(workout.classType)} size={theme.sizes.workoutRowImage} shape="rounded" />
          )}
          <Box flex={1} gap="extraSmall">
            <Typography variant="caption" color="textSecondary">
              {kindText}
            </Typography>
            <Typography variant="label" numberOfLines={2}>
              {workout.name}
            </Typography>
            {summary === null ? null : (
              <Typography variant="caption" color="textSecondary">
                {summary}
              </Typography>
            )}
            <StatusChip status={scheduledWorkout.status} date={scheduledWorkout.date} today={today} />
          </Box>
          {canStart ? <IconButton icon="play.fill" accessibilityLabel={`Start ${workout.name}`} onPress={onStart} color="accent" /> : null}
        </Stack>
      </Card>
    </Touchable>
  );
}
