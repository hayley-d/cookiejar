import { Alert } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';

import { IconButton } from '@/components/atoms/IconButton';
import { EmptyState } from '@/components/molecules/EmptyState';
import { PlanWeekEditor } from '@/components/organisms/PlanWeekEditor';
import { usePlan } from '@/hooks/usePlan';
import { usePlanActions } from '@/hooks/usePlanActions';
import { groupEntriesByWeekday } from '@/plans/groupEntriesByWeekday';

type PlanEditorParameters = {
  planId: string;
};

export default function PlanEditorScreen() {
  const { planId: planIdParameter } = useLocalSearchParams<PlanEditorParameters>();
  const planId = Number(planIdParameter);
  const { planLookup, removePlanEntry, renamePlan, duplicatePlan, deletePlan } = usePlan(planId);
  const { openMenu } = usePlanActions({
    planName: planLookup.status === 'found' ? planLookup.plan.name : '',
    isActive: planLookup.status === 'found' && planLookup.plan.isActive,
    renamePlan,
    duplicatePlan,
    deletePlan,
  });

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
      <Stack.Screen
        options={{
          title: planLookup.plan.name,
          headerRight: () => <IconButton icon="ellipsis" accessibilityLabel="Plan options" onPress={openMenu} />,
        }}
      />
      <PlanWeekEditor
        days={groupEntriesByWeekday(planLookup.plan.entries)}
        onChangeEntryTime={(planEntryId) =>
          router.push({
            pathname: '/plans/[planId]/entry-time',
            params: { planId: String(planId), planEntryId: String(planEntryId) },
          })
        }
        onRemoveEntry={(planEntryId) =>
          removePlanEntry(planEntryId).catch(() =>
            Alert.alert('Could not remove the workout', 'Something went wrong. Please try again.'),
          )
        }
        onCopyDay={(dayOfWeek) =>
          router.push({
            pathname: '/plans/[planId]/copy-day',
            params: { planId: String(planId), fromDay: String(dayOfWeek) },
          })
        }
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
