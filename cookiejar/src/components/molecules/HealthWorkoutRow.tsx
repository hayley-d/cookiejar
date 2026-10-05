import { Touchable } from '@/components/primitives/Touchable';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { describeWorkoutActivity } from '@/health/describeWorkoutActivity';
import { formatKilocalories, formatWorkoutDuration } from '@/health/formatWorkoutValues';
import type { HealthWorkout } from '@/health/HealthTypes';

type HealthWorkoutRowProperties = {
  workout: HealthWorkout;
  onPress: () => void;
  disabled?: boolean;
};

function formatClockTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function HealthWorkoutRow({ workout, onPress, disabled }: HealthWorkoutRowProperties) {
  const activityName = describeWorkoutActivity(workout.activityTypeCode);
  const timeRange = `${formatClockTime(workout.startDate)} – ${formatClockTime(workout.endDate)}`;
  const details = `${formatWorkoutDuration(workout.durationSeconds)} · ${formatKilocalories(workout.activeKilocalories)}`;
  const sourceLabel = workout.sourceName.length === 0 ? 'Unknown source' : workout.sourceName;

  return (
    <Touchable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={`${activityName}, ${timeRange}, ${details}, ${sourceLabel}`}
    >
      <Box gap="extraSmall" paddingVertical="small">
        <Typography variant="heading">{activityName}</Typography>
        <Typography color="textSecondary">{`${timeRange} · ${details}`}</Typography>
        <Typography variant="label" color="textSecondary">
          {sourceLabel}
        </Typography>
      </Box>
    </Touchable>
  );
}
