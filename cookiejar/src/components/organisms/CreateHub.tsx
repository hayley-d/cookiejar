import { useMemo, useState } from 'react';
import { ActionSheetIOS } from 'react-native';

import { Chip } from '@/components/atoms/Chip';
import { IconButton } from '@/components/atoms/IconButton';
import { Toast } from '@/components/atoms/Toast';
import { PlanRow } from '@/components/molecules/PlanRow';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { SearchBar } from '@/components/molecules/SearchBar';
import { SegmentedControl, type Segment } from '@/components/molecules/SegmentedControl';
import { WorkoutRow } from '@/components/molecules/WorkoutRow';
import { Box } from '@/components/primitives/Box';
import { List } from '@/components/primitives/List';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { SectionedList } from '@/components/primitives/SectionedList';
import { Stack } from '@/components/primitives/Stack';
import { Typography } from '@/components/primitives/Typography';
import { describePlanSummary } from '@/plans/describePlanSummary';
import { useTheme } from '@/theme/useTheme';
import type { PlanSummary } from '@/types/PlanSummary';
import type { WorkoutSummary } from '@/types/WorkoutSummary';
import { describeWorkout } from '@/workouts/describeWorkout';
import { filterWorkouts } from '@/workouts/filterWorkouts';
import { groupWorkoutsByLibrary } from '@/workouts/groupWorkoutsByLibrary';
import { filterWorkoutsByKind, workoutKindFilterOptions, type WorkoutKindFilter } from '@/workouts/workoutKindFilter';
import { workoutNuggie } from '@/workouts/workoutNuggie';
import { workoutTypeLabel } from '@/workouts/workoutTypeLabel';

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
  onOpenWorkout: (workout: WorkoutSummary) => void;
  onOpenPlan: (plan: PlanSummary) => void;
  onOpenExerciseLibrary: () => void;
  onEditWorkout: (workout: WorkoutSummary) => void;
  onDuplicateWorkout: (workout: WorkoutSummary) => void;
  onDeleteWorkout: (workout: WorkoutSummary) => void;
  onToastDismissed: () => void;
};

type CreateHubTab = 'workouts' | 'plans';

const tabSegments: Segment<CreateHubTab>[] = [
  { value: 'workouts', label: 'Workouts' },
  { value: 'plans', label: 'Plans' },
];

const editableWorkoutMenuOptions = ['Edit', 'Duplicate', 'Delete', 'Cancel'];
const builtInWorkoutMenuOptions = ['Duplicate', 'Delete', 'Cancel'];

type WorkoutMenuHandlers = Pick<CreateHubProperties, 'onEditWorkout' | 'onDuplicateWorkout' | 'onDeleteWorkout'>;

function openWorkoutMenu(workout: WorkoutSummary, handlers: WorkoutMenuHandlers) {
  const menuOptions = workout.builtInKey === null ? editableWorkoutMenuOptions : builtInWorkoutMenuOptions;
  ActionSheetIOS.showActionSheetWithOptions(
    {
      title: workout.name,
      options: menuOptions,
      destructiveButtonIndex: menuOptions.indexOf('Delete'),
      cancelButtonIndex: menuOptions.indexOf('Cancel'),
    },
    (optionIndex) => {
      const selectedOption = menuOptions[optionIndex];
      if (selectedOption === 'Edit') {
        handlers.onEditWorkout(workout);
      } else if (selectedOption === 'Duplicate') {
        handlers.onDuplicateWorkout(workout);
      } else if (selectedOption === 'Delete') {
        handlers.onDeleteWorkout(workout);
      }
    },
  );
}

function emptyMessage(items: unknown[] | null, isFiltered: boolean, noItemsMessage: string, noMatchMessage: string) {
  if (items === null) {
    return null;
  }
  return <Typography color="textSecondary">{isFiltered ? noMatchMessage : noItemsMessage}</Typography>;
}

export function CreateHub({
  workouts,
  plans,
  toast,
  onNewWorkout,
  onNewPlan,
  onOpenWorkout,
  onOpenPlan,
  onOpenExerciseLibrary,
  onEditWorkout,
  onDuplicateWorkout,
  onDeleteWorkout,
  onToastDismissed,
}: CreateHubProperties) {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState<CreateHubTab>('workouts');
  const [workoutSearchText, setWorkoutSearchText] = useState('');
  const [planSearchText, setPlanSearchText] = useState('');
  const [selectedKindFilter, setSelectedKindFilter] = useState<WorkoutKindFilter>('all');

  const kindFilterOptions = workoutKindFilterOptions(workouts ?? []);
  const activeKindFilter = kindFilterOptions.some((option) => option.value === selectedKindFilter)
    ? selectedKindFilter
    : 'all';
  const workoutGroups = useMemo(
    () => groupWorkoutsByLibrary(filterWorkoutsByKind(workouts ?? [], activeKindFilter), workoutSearchText),
    [workouts, activeKindFilter, workoutSearchText],
  );
  const visiblePlans = filterWorkouts(plans ?? [], planSearchText);
  const isWorkoutsTab = selectedTab === 'workouts';

  return (
    <Box flex={1}>
      <ScreenHeader
        title="Create"
        action={
          <Stack direction="horizontal" align="center">
            <IconButton icon="books.vertical" accessibilityLabel="Exercise library" onPress={onOpenExerciseLibrary} />
            <IconButton
              icon="plus"
              color="accent"
              accessibilityLabel={isWorkoutsTab ? 'New workout' : 'New plan'}
              onPress={isWorkoutsTab ? onNewWorkout : onNewPlan}
            />
          </Stack>
        }
      />
      <SegmentedControl segments={tabSegments} selectedValue={selectedTab} onSelect={setSelectedTab} />
      <Box paddingHorizontal="medium" paddingVertical="small">
        {isWorkoutsTab ? (
          <SearchBar value={workoutSearchText} onChangeText={setWorkoutSearchText} placeholder="Search workouts" />
        ) : (
          <SearchBar value={planSearchText} onChangeText={setPlanSearchText} placeholder="Search plans" />
        )}
      </Box>
      {isWorkoutsTab && kindFilterOptions.length > 0 ? (
        <ScrollBox
          horizontal
          showsHorizontalScrollIndicator={false}
          gap="small"
          style={{ flexGrow: 0 }}
        >
          {kindFilterOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              isSelected={option.value === activeKindFilter}
              onPress={() => setSelectedKindFilter(option.value)}
            />
          ))}
        </ScrollBox>
      ) : null}
      <Box flex={1}>
        {isWorkoutsTab ? (
          <SectionedList
            sections={workoutGroups}
            keyExtractor={(workout) => String(workout.id)}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            renderSectionHeader={({ section }) => (
              <Box background="background" paddingVertical="extraSmall">
                <Typography variant="heading">{section.title}</Typography>
              </Box>
            )}
            renderItem={({ item: workout }) => (
              <WorkoutRow
                name={workout.name}
                summary={describeWorkout(workout)}
                imageUrl={workout.imageUrl}
                nuggie={workoutNuggie(workout)}
                badgeLabel={workoutTypeLabel(workout) ?? undefined}
                onPress={() => onOpenWorkout(workout)}
                onLongPress={() => openWorkoutMenu(workout, { onEditWorkout, onDuplicateWorkout, onDeleteWorkout })}
              />
            )}
            ListEmptyComponent={emptyMessage(
              workouts,
              activeKindFilter !== 'all' || workoutSearchText.trim() !== '',
              'No workouts yet — tap + to build your first one.',
              'No workouts match.',
            )}
          />
        ) : (
          <List
            data={visiblePlans}
            keyExtractor={(plan) => String(plan.id)}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            renderItem={({ item: plan }) => (
              <PlanRow
                name={plan.name}
                summary={describePlanSummary(plan.entryCount)}
                isActive={plan.isActive}
                onPress={() => onOpenPlan(plan)}
              />
            )}
            ListEmptyComponent={emptyMessage(
              plans,
              planSearchText.trim() !== '',
              'No plans yet — tap + to schedule your week.',
              'No plans match.',
            )}
          />
        )}
      </Box>
      <Box pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: theme.spacing.medium }}>
        {toast ? <Toast key={toast.key} message={toast.message} onDismiss={onToastDismissed} /> : null}
      </Box>
    </Box>
  );
}
