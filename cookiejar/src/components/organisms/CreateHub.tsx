import { Toast } from '@/components/atoms/Toast';
import { ActionCard } from '@/components/molecules/ActionCard';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { WorkoutRow } from '@/components/molecules/WorkoutRow';
import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { List } from '@/components/primitives/List';
import { Stack } from '@/components/primitives/Stack';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';
import { classTypeLabels } from '@/types/ClassType';
import type { WorkoutSummary } from '@/types/WorkoutSummary';
import { classTypeNuggie } from '@/workouts/classTypeNuggie';
import { describeWorkout } from '@/workouts/describeWorkout';

export type CreateHubToast = {
  key: string;
  message: string;
};

type CreateHubProperties = {
  workouts: WorkoutSummary[] | null;
  toast: CreateHubToast | null;
  onNewWorkout: () => void;
  onOpenExerciseLibrary: () => void;
  onToastDismissed: () => void;
};

const chevronSize = 14;

function renderWorkout({ item: workout }: { item: WorkoutSummary }) {
  return (
    <WorkoutRow
      name={workout.name}
      summary={describeWorkout(workout)}
      imageUrl={workout.imageUrl}
      nuggie={workout.classType === null ? 'workout' : classTypeNuggie(workout.classType)}
      badgeLabel={workout.classType === null ? undefined : classTypeLabels[workout.classType]}
    />
  );
}

export function CreateHub({
  workouts,
  toast,
  onNewWorkout,
  onOpenExerciseLibrary,
  onToastDismissed,
}: CreateHubProperties) {
  const theme = useTheme();

  return (
    <Box flex={1}>
      <ScreenHeader title="Create" />
      <List
        data={workouts ?? []}
        keyExtractor={(workout) => String(workout.id)}
        renderItem={renderWorkout}
        ListHeaderComponent={
          <Stack gap="large">
            <ActionCard title="New workout" icon="dumbbell.fill" onPress={onNewWorkout} />
            <Typography variant="heading">My workouts</Typography>
          </Stack>
        }
        ListEmptyComponent={
          workouts === null ? null : (
            <Typography color="textSecondary">No workouts yet — tap New workout to build your first one.</Typography>
          )
        }
        ListFooterComponent={
          <Touchable onPress={onOpenExerciseLibrary} accessibilityLabel="Exercise library">
            <Stack
              direction="horizontal"
              gap="small"
              align="center"
              style={{ paddingVertical: theme.spacing.medium }}
            >
              <Typography variant="label" color="accent">
                Exercise library
              </Typography>
              <Icon name="chevron.right" size={chevronSize} color="accent" weight="semibold" />
            </Stack>
          </Touchable>
        }
      />
      <Box pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: theme.spacing.medium }}>
        {toast ? <Toast key={toast.key} message={toast.message} onDismiss={onToastDismissed} /> : null}
      </Box>
    </Box>
  );
}
