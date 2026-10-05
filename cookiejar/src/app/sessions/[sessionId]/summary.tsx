import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { EmptyState } from '@/components/molecules/EmptyState';
import { SessionSummary } from '@/components/organisms/SessionSummary';
import { findSuggestedHealthWorkout } from '@/health/findSuggestedHealthWorkout';
import { useFinishedSession } from '@/hooks/useFinishedSession';
import { useOverlappingHealthWorkouts } from '@/hooks/useOverlappingHealthWorkouts';
import { useUnlinkHealthWorkout } from '@/hooks/useUnlinkHealthWorkout';
import { countExercisesWithRecords } from '@/progress/detectPersonalRecords';
import { chooseStableFinishingPresentation } from '@/sessions/chooseFinishingNuggie';

type SessionSummaryParameters = {
  sessionId: string;
};

export default function SessionSummaryScreen() {
  const { sessionId: sessionIdParameter } = useLocalSearchParams<SessionSummaryParameters>();
  const sessionId = Number(sessionIdParameter);
  const lookup = useFinishedSession(sessionId);
  const healthWorkouts = useOverlappingHealthWorkouts(sessionId);
  const unlinkHealthWorkout = useUnlinkHealthWorkout(sessionId);
  const [openedAt] = useState(() => new Date());

  const confirmUnlink = () => {
    Alert.alert('Unlink Garmin workout?', 'Its heart rate, calories and duration will be removed from this workout.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unlink',
        style: 'destructive',
        onPress: () => {
          unlinkHealthWorkout().catch(() => {
            Alert.alert('Could not unlink the workout', 'Something went wrong. Please try again.');
          });
        },
      },
    ]);
  };

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

  const nuggie = chooseStableFinishingPresentation(sessionId, {
    workoutKind: lookup.session.workoutKind,
    classType: lookup.session.classType,
    personalRecordCount: countExercisesWithRecords(lookup.personalRecords),
  }).nuggie;

  const { session } = lookup;
  const suggestedWorkout =
    session.healthWorkoutUuid === null && session.finishedAt !== null && healthWorkouts.lookup.status === 'ready'
      ? findSuggestedHealthWorkout(new Date(session.startedAt), new Date(session.finishedAt), [
          ...healthWorkouts.lookup.groupedWorkouts.garminWorkouts,
          ...healthWorkouts.lookup.groupedWorkouts.otherWorkouts,
        ])
      : null;

  const linkSuggestedWorkout = () => {
    if (suggestedWorkout === null) {
      return;
    }
    healthWorkouts.link(suggestedWorkout).then(
      (result) => {
        if (result === 'failed') {
          Alert.alert('Could not link the workout', 'Something went wrong. Please try again.');
        }
      },
      () => {},
    );
  };

  return (
    <SessionSummary
      session={lookup.session}
      personalRecords={lookup.personalRecords}
      nuggie={nuggie}
      now={openedAt}
      onDone={() => router.back()}
      suggestedWorkout={suggestedWorkout}
      isLinkingSuggestedWorkout={healthWorkouts.isLinking}
      onLinkSuggestedWorkout={linkSuggestedWorkout}
      onLinkGarmin={() =>
        router.push({
          pathname: '/sessions/[sessionId]/link-health-workout',
          params: { sessionId: String(sessionId) },
        })
      }
      onUnlinkGarmin={confirmUnlink}
    />
  );
}
