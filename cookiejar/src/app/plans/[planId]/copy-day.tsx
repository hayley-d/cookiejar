import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import { EmptyState } from '@/components/molecules/EmptyState';
import { CopyDaySheet } from '@/components/organisms/CopyDaySheet';
import { usePlan } from '@/hooks/usePlan';
import { weekdays } from '@/plans/weekdays';

type CopyDayParameters = {
  planId: string;
  fromDay: string;
};

export default function CopyDayScreen() {
  const { planId: planIdParameter, fromDay: fromDayParameter } = useLocalSearchParams<CopyDayParameters>();
  const sourceWeekday = weekdays.find((candidate) => String(candidate.dayOfWeek) === fromDayParameter) ?? null;
  const { planLookup, copyDay } = usePlan(Number(planIdParameter));
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([]);
  const [isCopying, setIsCopying] = useState(false);
  const isCopyInFlight = useRef(false);

  if (sourceWeekday === null || planLookup.status === 'missing' || planLookup.status === 'failed') {
    return (
      <EmptyState
        nuggie="restDay"
        title="Could not copy the day"
        message={planLookup.status === 'missing' ? 'This plan may have been deleted.' : 'Please try again.'}
        actionLabel="Close"
        onAction={() => router.back()}
      />
    );
  }

  if (planLookup.status === 'loading') {
    return null;
  }

  const toggleDay = (dayOfWeek: number) =>
    setSelectedDaysOfWeek((current) =>
      current.includes(dayOfWeek) ? current.filter((candidate) => candidate !== dayOfWeek) : [...current, dayOfWeek],
    );

  const copy = async () => {
    if (isCopyInFlight.current) {
      return;
    }
    isCopyInFlight.current = true;
    setIsCopying(true);
    try {
      await copyDay(sourceWeekday.dayOfWeek, selectedDaysOfWeek);
      router.back();
    } catch {
      Alert.alert('Could not copy the day', 'Something went wrong. Please try again.');
    } finally {
      isCopyInFlight.current = false;
      setIsCopying(false);
    }
  };

  return (
    <CopyDaySheet
      sourceDayName={sourceWeekday.name}
      targetWeekdays={weekdays.filter((weekday) => weekday.dayOfWeek !== sourceWeekday.dayOfWeek)}
      selectedDaysOfWeek={selectedDaysOfWeek}
      onToggleDay={toggleDay}
      onCopy={copy}
      isCopying={isCopying}
    />
  );
}
