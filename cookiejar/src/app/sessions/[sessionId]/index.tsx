import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/molecules/EmptyState';
import { ClassSessionView } from '@/components/organisms/ClassSessionView';
import { NuggieLoadingScreen } from '@/components/organisms/NuggieLoadingScreen';
import { SessionLogger } from '@/components/organisms/SessionLogger';
import { Box } from '@/components/primitives/Box';
import { useSession } from '@/hooks/useSession';
import { useSessionExercisePicks } from '@/hooks/useSessionExercisePicks';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import type { NuggieName } from '@/nuggies/NuggieName';
import { describeUntickedSets, resolveFinishPrompt } from '@/sessions/finishPrompt';

type SessionLoggerParameters = {
  sessionId: string;
  isStarting?: string;
};

const defaultStartingCaption = 'Warming up…';

const startingCaptions: Partial<Record<NuggieName, string>> = {
  earlyMorning: 'Early start! Warming up…',
  workout: defaultStartingCaption,
};

function chooseStartingNuggie() {
  const now = new Date();
  return chooseNuggie({ kind: 'sessionStarting', startsAt: now }, now);
}

export default function SessionLoggerScreen() {
  const { sessionId: sessionIdParameter, isStarting } = useLocalSearchParams<SessionLoggerParameters>();
  const sessionId = Number(sessionIdParameter);
  const safeAreaInsets = useSafeAreaInsets();
  const {
    sessionLookup,
    previousSetsByExerciseId,
    changeSetValues,
    toggleSetCompletion,
    addSet,
    removeSet,
    addExercises,
    replaceExercise,
    removeExercise,
    changeExerciseRest,
    changeNotes,
    finish,
    discard,
  } = useSession(sessionId);
  const exercisePicks = useSessionExercisePicks({
    onAddExercises: addExercises,
    onReplaceExercise: replaceExercise,
  });
  const [startingNuggie] = useState(chooseStartingNuggie);
  const [isLoadingScreenVisible, setIsLoadingScreenVisible] = useState(isStarting === 'true');
  const [isFinishing, setIsFinishing] = useState(false);

  const hideLoadingScreen = useCallback(() => setIsLoadingScreenVisible(false), []);

  const completeFinish = async () => {
    setIsFinishing(true);
    try {
      await finish();
      router.replace({ pathname: '/sessions/[sessionId]/finishing', params: { sessionId: String(sessionId) } });
    } catch {
      setIsFinishing(false);
      Alert.alert('Could not finish the workout', 'Something went wrong. Please try again.');
    }
  };

  const completeDiscard = async () => {
    setIsFinishing(true);
    try {
      await discard();
      router.back();
    } catch {
      setIsFinishing(false);
      Alert.alert('Could not discard the workout', 'Something went wrong. Please try again.');
    }
  };

  const requestFinish = () => {
    if (sessionLookup.status !== 'found' || isFinishing) {
      return;
    }
    const finishPrompt = resolveFinishPrompt(sessionLookup.session.exercises);
    if (finishPrompt.kind === 'finish') {
      void completeFinish();
      return;
    }
    if (finishPrompt.kind === 'offerDiscard') {
      Alert.alert('No sets completed', 'Nothing has been ticked yet. Discard this workout instead?', [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => void completeDiscard() },
      ]);
      return;
    }
    Alert.alert(describeUntickedSets(finishPrompt.untickedSetCount), 'Unticked sets will be removed.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Finish', onPress: () => void completeFinish() },
    ]);
  };

  const requestDiscard = () => {
    if (isFinishing) {
      return;
    }
    Alert.alert('Discard this workout?', 'Everything logged in it will be deleted.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => void completeDiscard() },
    ]);
  };

  let content = null;
  if (sessionLookup.status === 'missing' || sessionLookup.status === 'failed') {
    content = (
      <Box flex={1} style={{ paddingTop: safeAreaInsets.top, paddingBottom: safeAreaInsets.bottom }}>
        <EmptyState
          nuggie="workout"
          title={sessionLookup.status === 'missing' ? 'Workout not found' : 'Could not open the workout'}
          message={
            sessionLookup.status === 'missing'
              ? 'This workout session may have been discarded.'
              : 'Something went wrong while loading it. Please try again.'
          }
          actionLabel="Close"
          onAction={() => router.back()}
        />
      </Box>
    );
  } else if (sessionLookup.status === 'found' && sessionLookup.session.workoutKind === 'class') {
    content = (
      <ClassSessionView
        session={sessionLookup.session}
        isFinishing={isFinishing}
        onChangeNotes={changeNotes}
        onMarkComplete={() => void completeFinish()}
        onDiscard={requestDiscard}
      />
    );
  } else if (sessionLookup.status === 'found') {
    content = (
      <SessionLogger
        session={sessionLookup.session}
        isFinishing={isFinishing}
        previousSetsByExerciseId={previousSetsByExerciseId}
        onChangeSetValues={changeSetValues}
        onToggleSetCompletion={toggleSetCompletion}
        onAddSet={addSet}
        onRemoveSet={removeSet}
        onChangeRest={changeExerciseRest}
        onReplaceExercise={(sessionExerciseId) =>
          exercisePicks.replaceExercise(
            sessionExerciseId,
            sessionLookup.session.exercises.map((sessionExercise) => sessionExercise.exerciseId),
          )
        }
        onRemoveExercise={removeExercise}
        onAddExercises={() =>
          exercisePicks.addExercises(
            sessionLookup.session.exercises.map((sessionExercise) => sessionExercise.exerciseId),
          )
        }
        onChangeNotes={changeNotes}
        onFinish={requestFinish}
        onDiscard={requestDiscard}
      />
    );
  }

  return (
    <Box flex={1} background="background">
      {content}
      {isLoadingScreenVisible ? (
        <NuggieLoadingScreen
          nuggie={startingNuggie}
          caption={startingCaptions[startingNuggie] ?? defaultStartingCaption}
          isReady={sessionLookup.status !== 'loading'}
          onFinished={hideLoadingScreen}
        />
      ) : null}
    </Box>
  );
}
