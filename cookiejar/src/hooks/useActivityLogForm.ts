import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import { activityMetricsFromHealthWorkout } from '@/activities/activityMetricsFromHealthWorkout';
import { buildActivityTimes } from '@/activities/buildActivityTimes';
import {
  activityLogDistanceMeters,
  activityLogDurationSeconds,
  validateActivityLogForm,
  type ActivityLogFormErrors,
  type ActivityLogFormValues,
} from '@/activities/validateActivityLogForm';
import {
  insertActivitySession,
  linkHealthWorkout,
  updateActivitySession,
} from '@/database/repositories/sessionRepository';
import type { HealthWorkout, WorkoutHeartRate } from '@/health/HealthTypes';
import { readWorkoutHeartRate } from '@/health/readHealthWorkouts';
import { bumpDataVersion } from '@/stores/dataVersionStore';

type PickedHealthWorkout = {
  workout: HealthWorkout;
  heartRate: WorkoutHeartRate;
};

const missingHeartRate: WorkoutHeartRate = { averageHeartRate: null, maximumHeartRate: null };

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
  const [pickedHealthWorkout, setPickedHealthWorkout] = useState<PickedHealthWorkout | null>(null);
  const isSaveInFlight = useRef(false);
  const isPickInFlight = useRef(false);

  const validationErrors = validateActivityLogForm(values);
  const errors: ActivityLogFormErrors = hasAttemptedSave ? validationErrors : {};

  function changeValues(nextValues: ActivityLogFormValues) {
    if (nextValues.date !== values.date) {
      setPickedHealthWorkout(null);
    }
    setValues(nextValues);
  }

  async function pickHealthWorkout(workout: HealthWorkout) {
    if (isPickInFlight.current) {
      return;
    }
    isPickInFlight.current = true;
    try {
      const heartRate = await readWorkoutHeartRate(workout.startDate, workout.endDate).catch(() => missingHeartRate);
      const metrics = activityMetricsFromHealthWorkout(workout, heartRate.averageHeartRate);
      setPickedHealthWorkout({ workout, heartRate });
      setValues((currentValues) => ({
        ...currentValues,
        activityType: metrics.activityType ?? currentValues.activityType,
        startTime: metrics.startTime,
        hours: metrics.hours,
        minutes: metrics.minutes,
        distanceKilometers: metrics.distanceKilometers,
        elevationGainMeters: metrics.elevationGainMeters,
        activeKilocalories: metrics.activeKilocalories,
        averageHeartRate: metrics.averageHeartRate,
      }));
    } finally {
      isPickInFlight.current = false;
    }
  }

  async function linkPickedHealthWorkout(targetSessionId: number) {
    if (pickedHealthWorkout === null) {
      return;
    }
    await linkHealthWorkout(database, targetSessionId, {
      healthWorkoutUuid: pickedHealthWorkout.workout.uuid,
      healthAverageHeartRate: pickedHealthWorkout.heartRate.averageHeartRate,
      healthMaximumHeartRate: pickedHealthWorkout.heartRate.maximumHeartRate,
      healthActiveKilocalories: pickedHealthWorkout.workout.activeKilocalories,
      healthDurationSeconds: pickedHealthWorkout.workout.durationSeconds,
    });
  }

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
        await linkPickedHealthWorkout(sessionId);
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
      try {
        await linkPickedHealthWorkout(insertedSessionId);
      } catch {
        Alert.alert('Activity logged', 'The Apple Health workout could not be linked. You can link it by tapping Edit on the summary.');
      }
      bumpDataVersion();
      router.replace({
        pathname: '/sessions/[sessionId]/summary',
        params: { sessionId: String(insertedSessionId) },
      });
    } catch {
      isSaveInFlight.current = false;
      setIsSaving(false);
      Alert.alert(
        sessionId === null ? 'Could not log the activity' : 'Could not save the activity',
        'Something went wrong. Please try again.',
      );
    }
  }

  return {
    values,
    errors,
    isSaving,
    pickedHealthWorkoutUuid: pickedHealthWorkout === null ? null : pickedHealthWorkout.workout.uuid,
    changeValues,
    pickHealthWorkout,
    save,
  };
}
