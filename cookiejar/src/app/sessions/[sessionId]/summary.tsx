import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { EmptyState } from '@/components/molecules/EmptyState';
import { SessionSummary } from '@/components/organisms/SessionSummary';
import { useFinishedSession } from '@/hooks/useFinishedSession';
import { countExercisesWithRecords } from '@/progress/detectPersonalRecords';
import { chooseStableFinishingPresentation, parseFinishingNuggie } from '@/sessions/chooseFinishingNuggie';

type SessionSummaryParameters = {
  sessionId: string;
  nuggie?: string;
};

export default function SessionSummaryScreen() {
  const { sessionId: sessionIdParameter, nuggie: nuggieParameter } = useLocalSearchParams<SessionSummaryParameters>();
  const sessionId = Number(sessionIdParameter);
  const lookup = useFinishedSession(sessionId);
  const [openedAt] = useState(() => new Date());

  if (lookup.status === 'missing' || lookup.status === 'failed') {
    return (
      <EmptyState
        nuggie="workout"
        title={lookup.status === 'missing' ? 'Workout not found' : 'Could not open the summary'}
        message={
          lookup.status === 'missing'
            ? 'This workout session may have been discarded.'
            : 'Something went wrong while loading it. Please try again.'
        }
        actionLabel="Back"
        onAction={() => router.back()}
      />
    );
  }

  if (lookup.status === 'loading') {
    return null;
  }

  const nuggie =
    parseFinishingNuggie(nuggieParameter) ??
    chooseStableFinishingPresentation(sessionId, {
      workoutKind: lookup.session.workoutKind,
      classType: lookup.session.classType,
      personalRecordCount: countExercisesWithRecords(lookup.personalRecords),
    }).nuggie;

  return (
    <SessionSummary
      session={lookup.session}
      personalRecords={lookup.personalRecords}
      nuggie={nuggie}
      now={openedAt}
      onDone={() => router.back()}
    />
  );
}
