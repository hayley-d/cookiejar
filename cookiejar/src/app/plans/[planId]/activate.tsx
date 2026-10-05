import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import { EmptyState } from '@/components/molecules/EmptyState';
import { ActivatePlanSheet } from '@/components/organisms/ActivatePlanSheet';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { startOfWeek } from '@/dates/startOfWeek';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { usePlan } from '@/hooks/usePlan';

type ActivateParameters = {
  planId: string;
};

export default function ActivatePlanScreen() {
  const { planId: planIdParameter } = useLocalSearchParams<ActivateParameters>();
  const { planLookup, activatePlan } = usePlan(Number(planIdParameter));
  const [chosenStartDate, setChosenStartDate] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSaveInFlight = useRef(false);

  if (planLookup.status === 'loading') {
    return null;
  }

  if (planLookup.status !== 'found') {
    return (
      <EmptyState
        nuggie="restDay"
        title="Could not activate the plan"
        message="This plan may have been deleted."
        actionLabel="Close"
        onAction={() => router.back()}
      />
    );
  }

  const { plan } = planLookup;
  const startDate =
    chosenStartDate ??
    (plan.isActive && plan.startsOn !== null ? parseLocalDateString(plan.startsOn) : startOfWeek(new Date()));

  const confirm = async () => {
    if (isSaveInFlight.current) {
      return;
    }
    isSaveInFlight.current = true;
    setIsSaving(true);
    try {
      await activatePlan(toLocalDateString(startDate));
      router.back();
    } catch {
      Alert.alert('Could not activate the plan', 'Something went wrong. Please try again.');
    } finally {
      isSaveInFlight.current = false;
      setIsSaving(false);
    }
  };

  return (
    <ActivatePlanSheet
      planName={plan.name}
      startDate={startDate}
      onChangeStartDate={setChosenStartDate}
      onConfirm={confirm}
      isSaving={isSaving}
    />
  );
}
