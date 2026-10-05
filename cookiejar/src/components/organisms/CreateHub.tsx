import { ActionSheetIOS } from 'react-native';

import { Toast } from '@/components/atoms/Toast';
import { ActionCard } from '@/components/molecules/ActionCard';
import { PlanRow } from '@/components/molecules/PlanRow';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { WorkoutRow } from '@/components/molecules/WorkoutRow';
import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { List } from '@/components/primitives/List';
import { Stack } from '@/components/primitives/Stack';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { describePlanSummary } from '@/plans/describePlanSummary';
import { useTheme } from '@/theme/useTheme';
import { classTypeLabels } from '@/types/ClassType';
import type { PlanSummary } from '@/types/PlanSummary';
import type { WorkoutSummary } from '@/types/WorkoutSummary';
import { describeWorkout } from '@/workouts/describeWorkout';
import { workoutNuggie } from '@/workouts/workoutNuggie';

export type CreateHubToast = {
  key: string;
  message: string;
};

type CreateHubProperties = {
  workouts: WorkoutSummary[] | null;
  plans: PlanSummary[] | null;
  toast: CreateHubToast | null;
  onNewWorkout: () => void;
  onNewPlan: () => void;
  onOpenPlan: (plan: PlanSummary) => void;
  onOpenExerciseLibrary: () => void;
  onEditWorkout: (workout: WorkoutSummary) => void;
  onDuplicateWorkout: (workout: WorkoutSummary) => void;
  onDeleteWorkout: (workout: WorkoutSummary) => void;
  onToastDismissed: () => void;
};

const workoutMenuOptions = ['Edit', 'Duplicate', 'Delete', 'Cancel'];
const workoutMenuDeleteIndex = 2;
const workoutMenuCancelIndex = 3;

type WorkoutMenuHandlers = Pick<CreateHubProperties, 'onEditWorkout' | 'onDuplicateWorkout' | 'onDeleteWorkout'>;

function openWorkoutMenu(workout: WorkoutSummary, handlers: WorkoutMenuHandlers) {
  ActionSheetIOS.showActionSheetWithOptions(
    {
      title: workout.name,
      options: workoutMenuOptions,
      destructiveButtonIndex: workoutMenuDeleteIndex,
      cancelButtonIndex: workoutMenuCancelIndex,
    },
    (optionIndex) => {
      if (optionIndex === 0) {
        handlers.onEditWorkout(workout);
      } else if (optionIndex === 1) {
        handlers.onDuplicateWorkout(workout);
      } else if (optionIndex === workoutMenuDeleteIndex) {
        handlers.onDeleteWorkout(workout);
      }
    },
  );
}

function renderWorkout(workout: WorkoutSummary, handlers: WorkoutMenuHandlers) {
  return (
    <WorkoutRow
      name={workout.name}
      summary={describeWorkout(workout)}
      imageUrl={workout.imageUrl}
      nuggie={workoutNuggie(workout.classType)}
      badgeLabel={workout.classType === null ? undefined : classTypeLabels[workout.classType]}
      onLongPress={() => openWorkoutMenu(workout, handlers)}
    />
  );
}

function renderPlans(plans: PlanSummary[] | null, onOpenPlan: (plan: PlanSummary) => void) {
  if (plans === null) {
    return null;
  }
  if (plans.length === 0) {
    return <Typography color="textSecondary">No plans yet — tap New plan to schedule your week.</Typography>;
  }
  return (
    <Stack gap="small">
      {plans.map((plan) => (
        <PlanRow
          key={plan.id}
          name={plan.name}
          summary={describePlanSummary(plan.entryCount)}
          isActive={plan.isActive}
          onPress={() => onOpenPlan(plan)}
        />
      ))}
    </Stack>
  );
}

export function CreateHub({
  workouts,
  plans,
  toast,
  onNewWorkout,
  onNewPlan,
  onOpenPlan,
  onOpenExerciseLibrary,
  onEditWorkout,
  onDuplicateWorkout,
  onDeleteWorkout,
  onToastDismissed,
}: CreateHubProperties) {
  const theme = useTheme();

  return (
    <Box flex={1}>
      <ScreenHeader title="Create" />
      <List
        data={workouts ?? []}
        keyExtractor={(workout) => String(workout.id)}
        renderItem={({ item: workout }) =>
          renderWorkout(workout, { onEditWorkout, onDuplicateWorkout, onDeleteWorkout })
        }
        ListHeaderComponent={
          <Stack gap="large">
            <ActionCard title="New workout" icon="dumbbell.fill" onPress={onNewWorkout} />
            <ActionCard title="New plan" icon="calendar.badge.plus" onPress={onNewPlan} />
            <Typography variant="heading">My plans</Typography>
            {renderPlans(plans, onOpenPlan)}
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
              <Icon name="chevron.right" size={theme.sizes.createHubChevron} color="accent" weight="semibold" />
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
