import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import { buildActivityTimes } from '@/activities/buildActivityTimes';
import {
  activityLogDistanceMeters,
  activityLogDurationSeconds,
  validateActivityLogForm,
  type ActivityLogFormErrors,
  type ActivityLogFormValues,
} from '@/activities/validateActivityLogForm';
import { insertActivitySession, updateActivitySession } from '@/database/repositories/sessionRepository';
import { bumpDataVersion } from '@/stores/dataVersionStore';

type ActivityLogFormOptions = {
  workoutId: number | null;
  sessionId: number | null;
  planEntryId: number | null;
  initialValues: ActivityLogFormValues;
};

export function useActivityLogForm({ workoutId, sessionId, planEntryId, initialValues }: ActivityLogFormOptions) {
  const database = useSQLiteContext();
  const [values, setValues] = useState<ActivityLogFormValues>(initialValues);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isSaveInFlight = useRef(false);

  const validationErrors = validateActivityLogForm(values);
  const errors: ActivityLogFormErrors = hasAttemptedSave ? validationErrors : {};

  async function save() {
    setHasAttemptedSave(true);
    if (Object.keys(validationErrors).length > 0 || isSaveInFlight.current) {
      return;
    }
    isSaveInFlight.current = true;
    setIsSaving(true);
    try {
      const { startedAt, finishedAt } = buildActivityTimes(
        values.date,
        values.startTime,
        activityLogDurationSeconds(values),
      );
      const trimmedNotes = values.notes.trim();
      const notes = trimmedNotes.length === 0 ? null : trimmedNotes;
      const distanceMeters = activityLogDistanceMeters(values);
      if (sessionId !== null) {
        await updateActivitySession(database, sessionId, {
          activityType: values.activityType,
          scheduledDate: values.date,
          startedAt,
          finishedAt,
          distanceMeters,
          elevationGainMeters: values.elevationGainMeters,
          activeKilocalories: values.activeKilocalories,
          averageHeartRate: values.averageHeartRate,
          notes,
        });
        bumpDataVersion();
        router.back();
        return;
      }
      if (workoutId === null) {
        throw new Error('A workout is required to log an activity');
      }
      const insertedSessionId = await insertActivitySession(database, {
        workoutId,
        planEntryId,
        activityType: values.activityType,
        scheduledDate: values.date,
        startedAt,
        finishedAt,
        distanceMeters,
        elevationGainMeters: values.elevationGainMeters,
        activeKilocalories: values.activeKilocalories,
        averageHeartRate: values.averageHeartRate,
        notes,
      });
      bumpDataVersion();
      router.replace({
        pathname: '/sessions/[sessionId]/summary',
        params: { sessionId: String(insertedSessionId) },
      });
    } catch {
      isSaveInFlight.current = false;
      setIsSaving(false);
      Alert.alert('Could not log the activity', 'Something went wrong. Please try again.');
    }
  }

  return { values, errors, isSaving, changeValues: setValues, save };
}
