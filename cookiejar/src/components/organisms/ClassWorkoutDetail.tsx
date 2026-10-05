import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { HeaderImageCard } from '@/components/molecules/HeaderImageCard';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import { useTheme } from '@/theme/useTheme';
import { classTypeLabels } from '@/types/ClassType';
import type { WorkoutWithItems } from '@/types/WorkoutWithItems';
import { startWorkout } from '@/workouts/startWorkout';

type ClassWorkoutDetailProperties = {
  workout: WorkoutWithItems;
  date: string;
  planEntryId: number | null;
};

export function ClassWorkoutDetail({ workout, date, planEntryId }: ClassWorkoutDetailProperties) {
  const theme = useTheme();
  const nuggie =
    workout.classType === null
      ? 'workout'
      : chooseNuggie({ kind: 'classDisplay', classType: workout.classType }, new Date());
  const hasDuration = workout.durationMinutes !== null && workout.durationMinutes > 0;
  const hasDescription = workout.description !== null && workout.description.trim().length > 0;

  return (
    <Box flex={1}>
      <ScrollBox gap="medium">
        <HeaderImageCard imageUrl={workout.imageUrl} nuggie={nuggie} background="accentSoft" />
        <Box gap="small">
          <Typography variant="display">{workout.name}</Typography>
          {workout.classType === null ? null : <Badge label={classTypeLabels[workout.classType].toUpperCase()} />}
          {hasDuration ? <Typography color="textSecondary">{`${workout.durationMinutes} min`}</Typography> : null}
        </Box>
        {hasDescription ? <Typography>{workout.description}</Typography> : null}
        <Box style={{ height: theme.sizes.detailBottomBarClearance }} />
      </ScrollBox>
      <Box
        padding="medium"
        background="background"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
      >
        <Button
          label="START CLASS"
          onPress={() => startWorkout({ workoutId: workout.id, date, planEntryId })}
        />
      </Box>
    </Box>
  );
}
