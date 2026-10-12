import { router, Stack, useLocalSearchParams } from 'expo-router';

import { TextButton } from '@/components/atoms/TextButton';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ActivityLogForm } from '@/components/organisms/ActivityLogForm';
import { splitDurationSeconds } from '@/activities/splitDurationSeconds';
import type { ActivityLogFormValues } from '@/activities/validateActivityLogForm';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { useActivityLogForm } from '@/hooks/useActivityLogForm';
import { useFinishedSession } from '@/hooks/useFinishedSession';
import { useWorkoutWithItems } from '@/hooks/useWorkoutWithItems';
import type { ActivityType } from '@/types/ActivityType';

type ActivityLogParameters = {
  workoutId?: string;
  sessionId?: string;
  date?: string;
  planEntryId?: string;
};

type ActivityLogSheetProperties = {
  workoutId: number | null;
  sessionId: number | null;
  planEntryId: number | null;
  initialValues: ActivityLogFormValues;
  lockedDate: string | null;
};

const defaultActivityType: ActivityType = 'hike';
const metersPerKilometer = 1000;
const millisecondsPerSecond = 1000;

function parseOptionalInteger(value: string | undefined): number | null {
  if (value === undefined) {
    return null;
  }
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) ? parsedValue : null;
}

function ActivityLogSheet(properties: ActivityLogSheetProperties) {
  const activityLogForm = useActivityLogForm({
    workoutId: properties.workoutId,
    sessionId: properties.sessionId,
    planEntryId: properties.planEntryId,
    initialValues: properties.initialValues,
  });

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
        lockedDate={properties.lockedDate}
        onChangeValues={activityLogForm.changeValues}
      />
    </>
  );
}

function EditActivityLogScreen({ sessionId }: { sessionId: number }) {
  const lookup = useFinishedSession(sessionId);

  if (lookup.status === 'missing' || lookup.status === 'failed') {
    return (
      <EmptyState
        nuggie="workout"
        title={lookup.status === 'missing' ? 'Activity not found' : 'Could not open the form'}
        message={
          lookup.status === 'missing'
            ? 'This activity may have been deleted.'
            : 'Something went wrong while loading it. Please try again.'
        }
        actionLabel="Back"
        onAction={() => router.back()}
      />
    );
  }

  if (lookup.status === 'loading') {
    return null;
  }

  const { session } = lookup;
  const durationSeconds =
    session.finishedAt === null
      ? 0
      : (new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / millisecondsPerSecond;
  const { hours, minutes } = splitDurationSeconds(durationSeconds);

  return (
    <ActivityLogSheet
      workoutId={null}
      sessionId={sessionId}
      planEntryId={session.planEntryId}
      lockedDate={session.planEntryId === null ? null : session.scheduledDate}
      initialValues={{
        activityType: session.activityType ?? defaultActivityType,
        date: session.scheduledDate,
        startTime: new Date(session.startedAt),
        hours,
        minutes,
        distanceKilometers: session.distanceMeters === null ? null : session.distanceMeters / metersPerKilometer,
        elevationGainMeters: session.elevationGainMeters,
        activeKilocalories: session.activeKilocalories,
        averageHeartRate: session.averageHeartRate,
        notes: session.notes ?? '',
      }}
    />
  );
}

function NewActivityLogScreen({
  workoutId,
  dateParameter,
  planEntryId,
}: {
  workoutId: number;
  dateParameter: string | undefined;
  planEntryId: number | null;
}) {
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

  const date = dateParameter ?? toLocalDateString(new Date());

  return (
    <ActivityLogSheet
      workoutId={workoutId}
      sessionId={null}
      planEntryId={planEntryId}
      lockedDate={planEntryId === null ? null : date}
      initialValues={{
        activityType: workoutLookup.workout.activityType ?? defaultActivityType,
        date,
        startTime: new Date(),
        hours: null,
        minutes: null,
        distanceKilometers: null,
        elevationGainMeters: null,
        activeKilocalories: null,
        averageHeartRate: null,
        notes: '',
      }}
    />
  );
}

export default function LogActivityScreen() {
  const {
    workoutId: workoutIdParameter,
    sessionId: sessionIdParameter,
    date: dateParameter,
    planEntryId: planEntryIdParameter,
  } = useLocalSearchParams<ActivityLogParameters>();

  if (sessionIdParameter !== undefined) {
    return <EditActivityLogScreen sessionId={Number(sessionIdParameter)} />;
  }

  return (
    <NewActivityLogScreen
      workoutId={Number(workoutIdParameter)}
      dateParameter={dateParameter}
      planEntryId={parseOptionalInteger(planEntryIdParameter)}
    />
  );
}
