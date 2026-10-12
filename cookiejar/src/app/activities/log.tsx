import { router, Stack, useLocalSearchParams } from 'expo-router';

import { TextButton } from '@/components/atoms/TextButton';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ActivityLogForm } from '@/components/organisms/ActivityLogForm';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { useActivityLogForm } from '@/hooks/useActivityLogForm';
import { useWorkoutWithItems } from '@/hooks/useWorkoutWithItems';
import type { ActivityType } from '@/types/ActivityType';

type ActivityLogParameters = {
  workoutId: string;
  date?: string;
  planEntryId?: string;
};

type ActivityLogSheetProperties = {
  workoutId: number;
  planEntryId: number | null;
  initialActivityType: ActivityType;
  initialDate: string;
};

const defaultActivityType: ActivityType = 'hike';

function parseOptionalInteger(value: string | undefined): number | null {
  if (value === undefined) {
    return null;
  }
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) ? parsedValue : null;
}

function ActivityLogSheet(properties: ActivityLogSheetProperties) {
  const activityLogForm = useActivityLogForm(properties);

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <TextButton label="Cancel" onPress={() => router.back()} />,
          headerRight: () => (
            <TextButton label="Save" onPress={activityLogForm.save} disabled={activityLogForm.isSaving} />
          ),
        }}
      />
      <ActivityLogForm
        values={activityLogForm.values}
        errors={activityLogForm.errors}
        onChangeValues={activityLogForm.changeValues}
      />
    </>
  );
}

export default function LogActivityScreen() {
  const {
    workoutId: workoutIdParameter,
    date: dateParameter,
    planEntryId: planEntryIdParameter,
  } = useLocalSearchParams<ActivityLogParameters>();
  const workoutId = Number(workoutIdParameter);
  const workoutLookup = useWorkoutWithItems(workoutId);

  if (workoutLookup.status === 'missing' || workoutLookup.status === 'failed') {
    return (
      <EmptyState
        nuggie="workout"
        title={workoutLookup.status === 'missing' ? 'Workout not found' : 'Could not open the form'}
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

  return (
    <ActivityLogSheet
      workoutId={workoutId}
      planEntryId={parseOptionalInteger(planEntryIdParameter)}
      initialActivityType={workoutLookup.workout.activityType ?? defaultActivityType}
      initialDate={dateParameter ?? toLocalDateString(new Date())}
    />
  );
}
