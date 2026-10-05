import { WorkoutRow } from '@/components/molecules/WorkoutRow';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Box } from '@/components/primitives/Box';
import { List } from '@/components/primitives/List';
import { Stack } from '@/components/primitives/Stack';
import { TimePickerBox } from '@/components/primitives/TimePickerBox';
import { Typography } from '@/components/primitives/Typography';
import { dateToTimeOfDay, timeOfDayToDate } from '@/plans/timeOfDay';
import { classTypeLabels } from '@/types/ClassType';
import type { WorkoutSummary } from '@/types/WorkoutSummary';
import { describeWorkout } from '@/workouts/describeWorkout';
import { filterWorkouts } from '@/workouts/filterWorkouts';
import { workoutNuggie } from '@/workouts/workoutNuggie';

type AddPlanEntrySheetProperties = {
  dayName: string;
  workouts: WorkoutSummary[] | null;
  searchText: string;
  onChangeSearchText: (searchText: string) => void;
  timeOfDay: string;
  onChangeTimeOfDay: (timeOfDay: string) => void;
  onSelectWorkout: (workout: WorkoutSummary) => void;
  isAdding: boolean;
};

function emptyMessage(workouts: WorkoutSummary[] | null, searchText: string) {
  if (workouts === null) {
    return null;
  }
  if (workouts.length === 0) {
    return 'No workouts yet — build one from Create first.';
  }
  return `No workouts match "${searchText.trim()}"`;
}

export function AddPlanEntrySheet({
  dayName,
  workouts,
  searchText,
  onChangeSearchText,
  timeOfDay,
  onChangeTimeOfDay,
  onSelectWorkout,
  isAdding,
}: AddPlanEntrySheetProperties) {
  const visibleWorkouts = filterWorkouts(workouts ?? [], searchText);
  const message = emptyMessage(workouts, searchText);

  return (
    <List
      data={visibleWorkouts}
      keyExtractor={(workout) => String(workout.id)}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item: workout }) => (
        <WorkoutRow
          name={workout.name}
          summary={describeWorkout(workout)}
          imageUrl={workout.imageUrl}
          nuggie={workoutNuggie(workout.classType)}
          badgeLabel={workout.classType === null ? undefined : classTypeLabels[workout.classType]}
          disabled={isAdding}
          onPress={() => onSelectWorkout(workout)}
        />
      )}
      ListHeaderComponent={
        <Stack gap="medium">
          <Typography variant="title">Add to {dayName}</Typography>
          <Stack direction="horizontal" align="center" justify="space-between">
            <Typography variant="label">Time</Typography>
            <TimePickerBox
              value={timeOfDayToDate(timeOfDay, new Date())}
              onChangeValue={(value) => onChangeTimeOfDay(dateToTimeOfDay(value))}
              accessibilityLabel="Time"
            />
          </Stack>
          <SearchBar value={searchText} onChangeText={onChangeSearchText} placeholder="Search workouts" />
        </Stack>
      }
      ListEmptyComponent={
        message === null ? null : (
          <Box paddingVertical="medium">
            <Typography color="textSecondary">{message}</Typography>
          </Box>
        )
      }
    />
  );
}
