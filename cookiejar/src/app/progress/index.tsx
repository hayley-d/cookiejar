import { router } from 'expo-router';
import { useState } from 'react';

import { EmptyState } from '@/components/molecules/EmptyState';
import { NuggieLoadingScreen } from '@/components/organisms/NuggieLoadingScreen';
import { ActivityCountSection } from '@/components/organisms/ActivityCountSection';
import { ClassCountSection } from '@/components/organisms/ClassCountSection';
import { ExerciseProgressSection } from '@/components/organisms/ExerciseProgressSection';
import { SwimStatisticsCard } from '@/components/organisms/SwimStatisticsCard';
import { RecentRecordsSection } from '@/components/organisms/RecentRecordsSection';
import { ProgressOverview } from '@/components/organisms/ProgressOverview';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { exerciseVideoHref } from '@/exercises/exerciseVideo';
import { useActivityStatistics } from '@/hooks/useActivityStatistics';
import { useClassStatistics } from '@/hooks/useClassStatistics';
import { useExercisesWithHistory } from '@/hooks/useExercisesWithHistory';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useSwimStatistics } from '@/hooks/useSwimStatistics';
import { useTrainingTotals } from '@/hooks/useTrainingTotals';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import { countNewRecordsThisMonth } from '@/progress/countNewRecordsThisMonth';
import { currentMonthRange, lifetimeRange } from '@/progress/currentMonthRange';

const recentRecordCount = 5;
const loadingMinimumDurationMilliseconds = 500;

function openRecords() {
  router.push('/progress/records');
}

function openClassStatistics() {
  router.push('/progress/classes');
}

function openActivityStatistics() {
  router.push('/progress/activities');
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
  const { personalRecords, hasLoadFailed: haveRecordsFailed } = usePersonalRecords();
  const { exercises } = useExercisesWithHistory();
  const { classStatistics } = useClassStatistics();
  const { activityStatistics } = useActivityStatistics();
  const { swimStatistics } = useSwimStatistics();
  const newRecordCount = countNewRecordsThisMonth(personalRecords, now);
  const [isLoadingScreenVisible, setIsLoadingScreenVisible] = useState(true);
  const hasLoadFailed = monthLookup.hasLoadFailed || lifetimeLookup.hasLoadFailed;
  const areRecordsSettled = personalRecords !== null || haveRecordsFailed;
  const isReady =
    hasLoadFailed || (monthLookup.totals !== null && lifetimeLookup.totals !== null && areRecordsSettled);

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
        <ClassCountSection statistics={classStatistics ?? []} onOpenStatistics={openClassStatistics} />
        <ActivityCountSection statistics={activityStatistics ?? []} onOpenStatistics={openActivityStatistics} />
        {swimStatistics === null ? null : (
          <SwimStatisticsCard statistics={swimStatistics} />
        )}
        <ExerciseProgressSection
          exercises={exercises ?? []}
          onPressExercise={openExerciseHistory}
          onPlayVideo={(video) => router.push(exerciseVideoHref(video))}
        />
      </ProgressOverview>
    </ScrollBox>
  );
}
