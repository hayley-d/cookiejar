import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { HeaderImageCard } from '@/components/molecules/HeaderImageCard';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import { useTheme } from '@/theme/useTheme';
import { activityTypeLabels } from '@/types/ActivityType';
import type { WorkoutWithItems } from '@/types/WorkoutWithItems';

type ActivityWorkoutDetailProperties = {
  workout: WorkoutWithItems;
  onLogActivity: () => void;
};

export function ActivityWorkoutDetail({ workout, onLogActivity }: ActivityWorkoutDetailProperties) {
  const theme = useTheme();
  const nuggie =
    workout.activityType === null
      ? 'workout'
      : chooseNuggie({ kind: 'activityDisplay', activityType: workout.activityType }, new Date());
  const hasDescription = workout.description !== null && workout.description.trim().length > 0;

  return (
    <Box flex={1}>
      <ScrollBox gap="medium">
        <HeaderImageCard imageUrl={workout.imageUrl} nuggie={nuggie} background="accentSoft" />
        <Box gap="small">
          <Typography variant="display">{workout.name}</Typography>
          {workout.activityType === null ? null : (
            <Badge label={activityTypeLabels[workout.activityType].toUpperCase()} />
          )}
        </Box>
        {hasDescription ? <Typography>{workout.description}</Typography> : null}
        <Box style={{ height: theme.sizes.detailBottomBarClearance }} />
      </ScrollBox>
      <Box
        padding="medium"
        background="background"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
      >
        <Button label="LOG ACTIVITY" onPress={onLogActivity} />
      </Box>
    </Box>
  );
}
