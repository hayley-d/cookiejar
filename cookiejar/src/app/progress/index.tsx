import { useState } from 'react';

import { EmptyState } from '@/components/molecules/EmptyState';
import { NuggieLoadingScreen } from '@/components/organisms/NuggieLoadingScreen';
import { ProgressOverview } from '@/components/organisms/ProgressOverview';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { useNewRecordCount } from '@/hooks/useNewRecordCount';
import { useTrainingTotals } from '@/hooks/useTrainingTotals';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import { currentMonthRange, lifetimeRange } from '@/progress/currentMonthRange';

const loadingMinimumDurationMilliseconds = 500;

export default function ProgressScreen() {
  const now = new Date();
  const monthLookup = useTrainingTotals(currentMonthRange(now));
  const lifetimeLookup = useTrainingTotals(lifetimeRange(now));
  const newRecordCount = useNewRecordCount();
  const [isLoadingScreenVisible, setIsLoadingScreenVisible] = useState(true);
  const hasLoadFailed = monthLookup.hasLoadFailed || lifetimeLookup.hasLoadFailed;
  const isReady = hasLoadFailed || (monthLookup.totals !== null && lifetimeLookup.totals !== null);

  if (isLoadingScreenVisible) {
    return (
      <NuggieLoadingScreen
        nuggie={chooseNuggie({ kind: 'analytics' }, now)}
        caption="Crunching your numbers"
        minimumDurationMilliseconds={loadingMinimumDurationMilliseconds}
        isReady={isReady}
        onFinished={() => setIsLoadingScreenVisible(false)}
      />
    );
  }

  if (monthLookup.totals === null || lifetimeLookup.totals === null) {
    return <EmptyState title="Could not load progress" message="Something went wrong. Please try again." />;
  }

  if (lifetimeLookup.totals.workoutCount === 0) {
    return <EmptyState nuggie="workout" title="Progress" message="Finish a workout to see progress" />;
  }

  return (
    <ScrollBox>
      <ProgressOverview monthTotals={monthLookup.totals} newRecordCount={newRecordCount} />
    </ScrollBox>
  );
}
