import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Image } from '@/components/primitives/Image';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { todayWorkoutActionLabel } from '@/home/todayWorkoutAction';
import { useTheme } from '@/theme/useTheme';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';
import {
  describeScheduledWorkoutKind,
  describeScheduledWorkoutSummary,
} from '@/workouts/describeScheduledWorkout';
import { workoutNuggie } from '@/workouts/workoutNuggie';

type TodayWorkoutCardProperties = {
  scheduledWorkout: ScheduledWorkout;
  width: number;
  onPress: () => void;
  onStart: () => void;
};

const completedImageOpacity = 0.55;

export function TodayWorkoutCard({ scheduledWorkout, width, onPress, onStart }: TodayWorkoutCardProperties) {
  const theme = useTheme();
  const { workout, status } = scheduledWorkout;
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageUrl = workout.imageUrl;
  const showsImage = imageUrl !== null && imageUrl !== failedImageUrl;
  const kindText = describeScheduledWorkoutKind(scheduledWorkout);
  const summary = describeScheduledWorkoutSummary(scheduledWorkout);
  const hasWorkout = workout.id !== null;
  const showsAction = status !== 'planned' || hasWorkout;

  return (
    <Touchable
      onPress={onPress}
      disabled={!hasWorkout}
      accessibilityLabel={summary === null ? `${kindText}, ${workout.name}` : `${kindText}, ${workout.name}, ${summary}`}
      style={{ width }}
    >
      <Card
        padding="none"
        style={{
          borderRadius: theme.radii.extraLarge,
          borderWidth: status === 'inProgress' ? theme.sizes.todayCardActiveBorderWidth : 0,
          borderColor: theme.colors.accent,
        }}
      >
        <View style={{ borderRadius: theme.radii.extraLarge, overflow: 'hidden' }}>
          <View
            style={{
              height: theme.sizes.todayCardImageHeight,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.accentSoft,
              opacity: status === 'completed' ? completedImageOpacity : 1,
            }}
          >
            {showsImage ? (
              <Image
                source={{ uri: imageUrl }}
                contentFit="cover"
                style={{ width: '100%', height: '100%' }}
                onError={() => setFailedImageUrl(imageUrl)}
              />
            ) : (
              <NuggieImage name={workoutNuggie(workout.classType)} size={theme.sizes.todayCardNuggie} />
            )}
          </View>
          <Box padding="medium" gap="small">
            <Typography variant="caption" color="textSecondary">
              {kindText.toLocaleUpperCase()}
            </Typography>
            <Typography variant="heading" numberOfLines={2}>
              {workout.name}
            </Typography>
            <Box direction="row" align="center" justify="space-between" gap="small">
              <Typography color="textSecondary">{summary ?? ''}</Typography>
              {showsAction ? (
                <Button
                  label={todayWorkoutActionLabel(status)}
                  variant={status === 'completed' ? 'secondary' : 'primary'}
                  onPress={status === 'planned' ? onStart : onPress}
                />
              ) : null}
            </Box>
          </Box>
        </View>
      </Card>
    </Touchable>
  );
}
