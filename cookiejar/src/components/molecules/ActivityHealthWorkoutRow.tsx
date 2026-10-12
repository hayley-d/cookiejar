import { Badge } from '@/components/atoms/Badge';
import { Box } from '@/components/primitives/Box';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { formatDistance } from '@/activities/formatActivityValues';
import { describeWorkoutActivity } from '@/health/describeWorkoutActivity';
import { formatWorkoutDuration } from '@/health/formatWorkoutValues';
import type { HealthWorkout } from '@/health/HealthTypes';
import { isGarminSource } from '@/health/isGarminSource';
import { useTheme } from '@/theme/useTheme';

type ActivityHealthWorkoutRowProperties = {
  workout: HealthWorkout;
  isSelected: boolean;
  onPress: () => void;
};

export function ActivityHealthWorkoutRow({ workout, isSelected, onPress }: ActivityHealthWorkoutRowProperties) {
  const theme = useTheme();
  const activityName = describeWorkoutActivity(workout.activityTypeCode);
  const startTime = workout.startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const distance = workout.distanceMeters === null ? null : formatDistance(workout.distanceMeters);
  const details = [startTime, formatWorkoutDuration(workout.durationSeconds), distance]
    .filter((detail) => detail !== null)
    .join(' · ');

  return (
    <Touchable
      onPress={onPress}
      accessibilityLabel={`${activityName}, ${details}`}
      accessibilityState={{ selected: isSelected }}
      style={{
        borderRadius: theme.radii.medium,
        borderWidth: 1,
        borderColor: isSelected ? theme.colors.accent : theme.colors.border,
        padding: theme.spacing.medium,
      }}
    >
      <Box direction="row" justify="space-between" align="center" gap="medium">
        <Box gap="extraSmall" flex={1}>
          <Typography variant="heading">{activityName}</Typography>
          <Typography color="textSecondary">{details}</Typography>
        </Box>
        {isGarminSource(workout) ? <Badge label="Garmin" /> : null}
      </Box>
    </Touchable>
  );
}
