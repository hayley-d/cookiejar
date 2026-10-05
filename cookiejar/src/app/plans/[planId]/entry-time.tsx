import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import { EmptyState } from '@/components/molecules/EmptyState';
import { EntryTimeSheet } from '@/components/organisms/EntryTimeSheet';
import { usePlan } from '@/hooks/usePlan';
import { weekdayName } from '@/plans/weekdays';

type EntryTimeParameters = {
  planId: string;
  planEntryId: string;
};

export default function EntryTimeScreen() {
  const { planId: planIdParameter, planEntryId: planEntryIdParameter } = useLocalSearchParams<EntryTimeParameters>();
  const planEntryId = Number(planEntryIdParameter);
  const { planLookup, updatePlanEntryTime } = usePlan(Number(planIdParameter));
  const [chosenTimeOfDay, setChosenTimeOfDay] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSaveInFlight = useRef(false);

  if (planLookup.status === 'loading') {
    return null;
  }

  const entry = planLookup.status === 'found' ? planLookup.plan.entries.find((candidate) => candidate.id === planEntryId) : undefined;

  if (entry === undefined) {
    return (
      <EmptyState
        nuggie="restDay"
        title="Could not change the time"
        message="This workout may have been removed."
        actionLabel="Close"
        onAction={() => router.back()}
      />
    );
  }

  const timeOfDay = chosenTimeOfDay ?? entry.timeOfDay;

  const save = async () => {
    if (isSaveInFlight.current) {
      return;
    }
    isSaveInFlight.current = true;
    setIsSaving(true);
    try {
      await updatePlanEntryTime(entry.id, timeOfDay);
      router.back();
    } catch {
      Alert.alert('Could not change the time', 'Something went wrong. Please try again.');
    } finally {
      isSaveInFlight.current = false;
      setIsSaving(false);
    }
  };

  return (
    <EntryTimeSheet
      workoutName={entry.workout.name}
      dayName={weekdayName(entry.dayOfWeek)}
      timeOfDay={timeOfDay}
      onChangeTimeOfDay={setChosenTimeOfDay}
      onSave={save}
      isSaving={isSaving}
    />
  );
}
