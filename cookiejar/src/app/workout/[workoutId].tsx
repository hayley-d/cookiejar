import { router, Stack, useLocalSearchParams } from 'expo-router';

import { IconButton } from '@/components/atoms/IconButton';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ClassWorkoutDetail } from '@/components/organisms/ClassWorkoutDetail';
import { IndividualWorkoutDetail } from '@/components/organisms/IndividualWorkoutDetail';
import { useWorkoutWithItems } from '@/hooks/useWorkoutWithItems';
import { toLocalDateString } from '@/dates/toLocalDateString';

type WorkoutDetailParameters = {
  workoutId: string;
  date?: string;
  planEntryId?: string;
};

function parseOptionalInteger(value: string | undefined): number | null {
  if (value === undefined) {
    return null;
  }
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) ? parsedValue : null;
}

export default function WorkoutDetailScreen() {
  const {
    workoutId: workoutIdParameter,
    date: dateParameter,
    planEntryId: planEntryIdParameter,
  } = useLocalSearchParams<WorkoutDetailParameters>();
  const workoutId = Number(workoutIdParameter);
  const workoutLookup = useWorkoutWithItems(workoutId);

  if (workoutLookup.status === 'missing' || workoutLookup.status === 'failed') {
    return (
      <EmptyState
        nuggie="workout"
        title={workoutLookup.status === 'missing' ? 'Workout not found' : 'Could not open the workout'}
        message={
          workoutLookup.status === 'missing'
            ? 'This workout may have been deleted.'
            : 'Something went wrong while loading it. Please try again.'
        }
        actionLabel="Back"
        onAction={() => router.back()}
      />
    );
  }

  if (workoutLookup.status === 'loading') {
    return null;
  }

  const { workout } = workoutLookup;
  const date = dateParameter ?? toLocalDateString(new Date());
  const planEntryId = parseOptionalInteger(planEntryIdParameter);

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <IconButton
              icon="pencil"
              accessibilityLabel="Edit workout"
              onPress={() =>
                router.push({ pathname: '/workouts/[workoutId]/edit', params: { workoutId: String(workout.id) } })
              }
              color="accent"
            />
          ),
        }}
      />
      {workout.kind === 'individual' ? (
        <IndividualWorkoutDetail workout={workout} date={date} planEntryId={planEntryId} />
      ) : (
        <ClassWorkoutDetail workout={workout} date={date} planEntryId={planEntryId} />
      )}
    </>
  );
}
