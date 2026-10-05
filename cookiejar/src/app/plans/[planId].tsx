import { router, Stack, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/molecules/EmptyState';
import { PlanWeekEditor } from '@/components/organisms/PlanWeekEditor';
import { usePlan } from '@/hooks/usePlan';
import { groupEntriesByWeekday } from '@/plans/groupEntriesByWeekday';

type PlanEditorParameters = {
  planId: string;
};

export default function PlanEditorScreen() {
  const { planId: planIdParameter } = useLocalSearchParams<PlanEditorParameters>();
  const planId = Number(planIdParameter);
  const { planLookup } = usePlan(planId);

  if (planLookup.status === 'missing' || planLookup.status === 'failed') {
    return (
      <EmptyState
        nuggie="restDay"
        title={planLookup.status === 'missing' ? 'Plan not found' : 'Could not open the plan'}
        message={
          planLookup.status === 'missing'
            ? 'This plan may have been deleted.'
            : 'Something went wrong while loading it. Please try again.'
        }
        actionLabel="Back"
        onAction={() => router.back()}
      />
    );
  }

  if (planLookup.status === 'loading') {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ title: planLookup.plan.name }} />
      <PlanWeekEditor
        days={groupEntriesByWeekday(planLookup.plan.entries)}
        onAddEntry={(dayOfWeek) =>
          router.push({
            pathname: '/plans/[planId]/add-entry',
            params: { planId: String(planId), dayOfWeek: String(dayOfWeek) },
          })
        }
      />
    </>
  );
}
