import { Button } from '@/components/atoms/Button';
import { HealthWorkoutRow } from '@/components/molecules/HealthWorkoutRow';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import type { GroupedHealthWorkouts } from '@/health/groupHealthWorkouts';
import type { HealthWorkout } from '@/health/HealthTypes';

type LinkHealthWorkoutSheetStatus = 'loading' | 'unavailable' | 'failed' | 'ready';

type LinkHealthWorkoutSheetProperties = {
  status: LinkHealthWorkoutSheetStatus;
  groupedWorkouts: GroupedHealthWorkouts | null;
  isLinking: boolean;
  onPickWorkout: (workout: HealthWorkout) => void;
  onRefresh: () => void;
};

export function LinkHealthWorkoutSheet({
  status,
  groupedWorkouts,
  isLinking,
  onPickWorkout,
  onRefresh,
}: LinkHealthWorkoutSheetProperties) {
  if (status === 'loading') {
    return null;
  }

  if (status === 'unavailable') {
    return (
      <ScrollBox gap="medium" padding="large">
        <Typography variant="title">Link Garmin workout</Typography>
        <Typography color="textSecondary" align="center">
          Connect Apple Health on Home first
        </Typography>
      </ScrollBox>
    );
  }

  if (status === 'failed') {
    return (
      <ScrollBox gap="medium" padding="large">
        <Typography variant="title">Link Garmin workout</Typography>
        <Box gap="medium" align="center">
          <Typography color="textSecondary" align="center">
            Could not read Apple Health
          </Typography>
          <Button label="Refresh" variant="secondary" onPress={onRefresh} />
        </Box>
      </ScrollBox>
    );
  }

  const hasGarminWorkouts = groupedWorkouts !== null && groupedWorkouts.garminWorkouts.length > 0;
  const hasOtherWorkouts = groupedWorkouts !== null && groupedWorkouts.otherWorkouts.length > 0;

  return (
    <ScrollBox gap="medium" padding="large">
      <Typography variant="title">Link Garmin workout</Typography>
      {hasGarminWorkouts ? null : (
        <Box gap="medium" align="center">
          <Typography color="textSecondary" align="center">
            No Garmin workout found around this time — make sure Garmin Connect has synced
          </Typography>
          <Button label="Refresh" variant="secondary" onPress={onRefresh} />
        </Box>
      )}
      {hasGarminWorkouts
        ? groupedWorkouts.garminWorkouts.map((workout) => (
            <HealthWorkoutRow
              key={workout.uuid}
              workout={workout}
              disabled={isLinking}
              onPress={() => onPickWorkout(workout)}
            />
          ))
        : null}
      {hasOtherWorkouts ? (
        <Box gap="small">
          <Typography variant="label" color="textSecondary">
            Other sources
          </Typography>
          {groupedWorkouts.otherWorkouts.map((workout) => (
            <HealthWorkoutRow
              key={workout.uuid}
              workout={workout}
              disabled={isLinking}
              onPress={() => onPickWorkout(workout)}
            />
          ))}
        </Box>
      ) : null}
    </ScrollBox>
  );
}
