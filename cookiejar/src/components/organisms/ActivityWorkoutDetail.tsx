import { Badge } from '@/components/atoms/Badge';
import { HeaderImageCard } from '@/components/molecules/HeaderImageCard';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import { activityTypeLabels } from '@/types/ActivityType';
import type { WorkoutWithItems } from '@/types/WorkoutWithItems';

type ActivityWorkoutDetailProperties = {
  workout: WorkoutWithItems;
};

export function ActivityWorkoutDetail({ workout }: ActivityWorkoutDetailProperties) {
  const nuggie =
    workout.activityType === null
      ? 'workout'
      : chooseNuggie({ kind: 'activityDisplay', activityType: workout.activityType }, new Date());
  const hasDescription = workout.description !== null && workout.description.trim().length > 0;

  return (
    <ScrollBox gap="medium">
      <HeaderImageCard imageUrl={workout.imageUrl} nuggie={nuggie} background="accentSoft" />
      <Box gap="small">
        <Typography variant="display">{workout.name}</Typography>
        {workout.activityType === null ? null : (
          <Badge label={activityTypeLabels[workout.activityType].toUpperCase()} />
        )}
      </Box>
      {hasDescription ? <Typography>{workout.description}</Typography> : null}
    </ScrollBox>
  );
}
