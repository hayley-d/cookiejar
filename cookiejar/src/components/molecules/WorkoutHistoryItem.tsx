import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import type { Workout } from '@/types/Workout';

type WorkoutHistoryItemProperties = {
  workout: Workout;
};

const millisecondsPerMinute = 60_000;

function describeDuration(workout: Workout) {
  if (!workout.finishedAt) {
    return 'In progress';
  }
  const elapsedMilliseconds = Date.parse(workout.finishedAt) - Date.parse(workout.startedAt);
  return `${Math.round(elapsedMilliseconds / millisecondsPerMinute)} min`;
}

export function WorkoutHistoryItem({ workout }: WorkoutHistoryItemProperties) {
  const startedDate = new Date(workout.startedAt).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <Box padding="medium" gap="extraSmall" radius="medium" background="surface" borderColor="border">
      <Typography variant="label">{startedDate}</Typography>
      <Typography variant="caption" color="textSecondary">
        {describeDuration(workout)}
      </Typography>
    </Box>
  );
}
