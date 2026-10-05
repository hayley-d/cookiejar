import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import { EmptyState } from '@/components/molecules/EmptyState';
import { AddPlanEntrySheet } from '@/components/organisms/AddPlanEntrySheet';
import { usePlan } from '@/hooks/usePlan';
import { useWorkouts } from '@/hooks/useWorkouts';
import { defaultTimeOfDayForNewEntry } from '@/plans/timeOfDay';
import { weekdays } from '@/plans/weekdays';
import type { WorkoutSummary } from '@/types/WorkoutSummary';

type AddPlanEntryParameters = {
  planId: string;
  dayOfWeek: string;
};

export default function AddPlanEntryScreen() {
  const { planId: planIdParameter, dayOfWeek: dayOfWeekParameter } = useLocalSearchParams<AddPlanEntryParameters>();
  const planId = Number(planIdParameter);
  const weekday = weekdays.find((candidate) => String(candidate.dayOfWeek) === dayOfWeekParameter) ?? null;
  const { planLookup, addPlanEntry } = usePlan(planId);
  const { workouts } = useWorkouts();
  const [searchText, setSearchText] = useState('');
  const [chosenTimeOfDay, setChosenTimeOfDay] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const isAddInFlight = useRef(false);

  if (weekday === null || planLookup.status === 'missing' || planLookup.status === 'failed') {
    return (
      <EmptyState
        nuggie="restDay"
        title="Could not add a workout"
        message={planLookup.status === 'missing' ? 'This plan may have been deleted.' : 'Please try again.'}
        actionLabel="Close"
        onAction={() => router.back()}
      />
    );
  }

  if (planLookup.status === 'loading') {
    return null;
  }

  const defaultTimeOfDay = defaultTimeOfDayForNewEntry(
    planLookup.plan.entries
      .filter((entry) => entry.dayOfWeek === weekday.dayOfWeek)
      .map((entry) => entry.timeOfDay),
  );
  const timeOfDay = chosenTimeOfDay ?? defaultTimeOfDay;

  const addWorkout = async (workout: WorkoutSummary) => {
    if (isAddInFlight.current) {
      return;
    }
    isAddInFlight.current = true;
    setIsAdding(true);
    try {
      await addPlanEntry({ workoutId: workout.id, dayOfWeek: weekday.dayOfWeek, timeOfDay });
      router.back();
    } catch {
      Alert.alert('Could not add the workout', 'Something went wrong. Please try again.');
    } finally {
      isAddInFlight.current = false;
      setIsAdding(false);
    }
  };

  return (
    <AddPlanEntrySheet
      dayName={weekday.name}
      workouts={workouts}
      searchText={searchText}
      onChangeSearchText={setSearchText}
      timeOfDay={timeOfDay}
      onChangeTimeOfDay={setChosenTimeOfDay}
      onSelectWorkout={addWorkout}
      isAdding={isAdding}
    />
  );
}
