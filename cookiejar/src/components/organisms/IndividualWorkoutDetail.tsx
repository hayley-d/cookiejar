import { Button } from '@/components/atoms/Button';
import { HeaderImageCard } from '@/components/molecules/HeaderImageCard';
import { WorkoutDetailExerciseRow } from '@/components/molecules/WorkoutDetailExerciseRow';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';
import { bodyPartLabels } from '@/types/BodyPart';
import type { WorkoutWithItems } from '@/types/WorkoutWithItems';
import { estimateMinutesForWorkoutWithItems } from '@/workouts/estimateWorkoutMinutes';
import { startWorkout } from '@/workouts/startWorkout';
import { toSupersetCardPositions } from '@/workouts/supersetCardPositions';
import { workoutNuggie } from '@/workouts/workoutNuggie';

type IndividualWorkoutDetailProperties = {
  workout: WorkoutWithItems;
  date: string;
  planEntryId: number | null;
};

function describeSummary(workout: WorkoutWithItems): string {
  const exerciseCount = workout.items.length;
  const parts = [`${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}`];
  const estimatedMinutes = estimateMinutesForWorkoutWithItems(workout);
  if (estimatedMinutes > 0) {
    parts.push(`~${estimatedMinutes} min`);
  }
  const bodyPartLabelsInOrder = [...new Set(workout.items.map((item) => item.exercise.bodyPart))].map(
    (bodyPart) => bodyPartLabels[bodyPart],
  );
  if (bodyPartLabelsInOrder.length > 0) {
    parts.push(bodyPartLabelsInOrder.join(', '));
  }
  return parts.join(' · ');
}

export function IndividualWorkoutDetail({ workout, date, planEntryId }: IndividualWorkoutDetailProperties) {
  const theme = useTheme();
  const positions = toSupersetCardPositions(workout.items);

  return (
    <Box flex={1}>
      <ScrollBox gap="medium">
        <HeaderImageCard imageUrl={workout.imageUrl} nuggie={workoutNuggie(null)} />
        <Box gap="extraSmall">
          <Typography variant="display">{workout.name}</Typography>
          <Typography color="textSecondary">{describeSummary(workout)}</Typography>
        </Box>
        {workout.items.map((item, index) => (
          <WorkoutDetailExerciseRow
            key={item.id}
            name={item.exercise.name}
            imageUrl={item.exercise.imageUrl}
            label={positions[index]?.label ?? null}
            bracket={positions[index]?.bracket ?? null}
            trackingType={item.trackingType}
            targetSets={item.targetSets}
          />
        ))}
        <Box style={{ height: theme.sizes.detailBottomBarClearance }} />
      </ScrollBox>
      <Box
        padding="medium"
        background="background"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
      >
        <Button
          label="START WORKOUT"
          onPress={() => startWorkout({ workoutId: workout.id, date, planEntryId })}
        />
      </Box>
    </Box>
  );
}
