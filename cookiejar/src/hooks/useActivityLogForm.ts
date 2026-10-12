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
import { insertActivitySession } from '@/database/repositories/sessionRepository';
import { bumpDataVersion } from '@/stores/dataVersionStore';
import type { ActivityType } from '@/types/ActivityType';

type ActivityLogFormOptions = {
  workoutId: number;
  planEntryId: number | null;
  initialActivityType: ActivityType;
  initialDate: string;
};

export function useActivityLogForm({
  workoutId,
  planEntryId,
  initialActivityType,
  initialDate,
}: ActivityLogFormOptions) {
  const database = useSQLiteContext();
  const [values, setValues] = useState<ActivityLogFormValues>(() => ({
    activityType: initialActivityType,
    date: initialDate,
    startTime: new Date(),
    hours: null,
    minutes: null,
    distanceKilometers: null,
    elevationGainMeters: null,
    activeKilocalories: null,
    averageHeartRate: null,
    notes: '',
  }));
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
      const sessionId = await insertActivitySession(database, {
        workoutId,
        planEntryId,
        activityType: values.activityType,
        scheduledDate: values.date,
        startedAt,
        finishedAt,
        distanceMeters: activityLogDistanceMeters(values),
        elevationGainMeters: values.elevationGainMeters,
        activeKilocalories: values.activeKilocalories,
        averageHeartRate: values.averageHeartRate,
        notes: trimmedNotes.length === 0 ? null : trimmedNotes,
      });
      bumpDataVersion();
      router.replace({ pathname: '/sessions/[sessionId]/summary', params: { sessionId: String(sessionId) } });
    } catch {
      isSaveInFlight.current = false;
      setIsSaving(false);
      Alert.alert('Could not log the activity', 'Something went wrong. Please try again.');
    }
  }

  return { values, errors, isSaving, changeValues: setValues, save };
}
