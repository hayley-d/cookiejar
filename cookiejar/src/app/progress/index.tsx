import { router } from 'expo-router';
import { useState } from 'react';

import { EmptyState } from '@/components/molecules/EmptyState';
import { NuggieLoadingScreen } from '@/components/organisms/NuggieLoadingScreen';
import { ExerciseProgressSection } from '@/components/organisms/ExerciseProgressSection';
import { RecentRecordsSection } from '@/components/organisms/RecentRecordsSection';
import { ProgressOverview } from '@/components/organisms/ProgressOverview';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { useExercisesWithHistory } from '@/hooks/useExercisesWithHistory';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useTrainingTotals } from '@/hooks/useTrainingTotals';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import { countPersonalRecordsInRange } from '@/progress/buildPersonalRecordList';
import { currentMonthRange, lifetimeRange } from '@/progress/currentMonthRange';

const recentRecordCount = 5;
const loadingMinimumDurationMilliseconds = 500;

function openRecords() {
  router.push('/progress/records');
}

function openExerciseHistory(exerciseId: number) {
  router.push({ pathname: '/progress/exercises/[exerciseId]', params: { exerciseId: String(exerciseId) } });
}

function openSessionSummary(sessionId: number) {
  router.push({ pathname: '/sessions/[sessionId]/summary', params: { sessionId: String(sessionId) } });
}

export default function ProgressScreen() {
  const now = new Date();
  const monthLookup = useTrainingTotals(currentMonthRange(now));
  const lifetimeLookup = useTrainingTotals(lifetimeRange(now));
  const { personalRecords } = usePersonalRecords();
  const { exercises } = useExercisesWithHistory();
  const newRecordCount =
    personalRecords === null ? 0 : countPersonalRecordsInRange(personalRecords, currentMonthRange(now));
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
      <ProgressOverview monthTotals={monthLookup.totals} newRecordCount={newRecordCount}>
        <RecentRecordsSection
          items={(personalRecords ?? []).slice(0, recentRecordCount)}
          onPressItem={openSessionSummary}
          onSeeAll={openRecords}
        />
        <ExerciseProgressSection exercises={exercises ?? []} onPressExercise={openExerciseHistory} />
      </ProgressOverview>
    </ScrollBox>
  );
}
