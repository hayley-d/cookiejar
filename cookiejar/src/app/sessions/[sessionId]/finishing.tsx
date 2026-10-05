import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';

import { NuggieLoadingScreen } from '@/components/organisms/NuggieLoadingScreen';
import { Box } from '@/components/primitives/Box';
import { useFinishedSession } from '@/hooks/useFinishedSession';
import { countExercisesWithRecords } from '@/progress/detectPersonalRecords';
import { chooseStableFinishingPresentation } from '@/sessions/chooseFinishingNuggie';

type FinishingParameters = {
  sessionId: string;
};

const fallbackCaption = 'Workout complete!';

export default function FinishingScreen() {
  const { sessionId: sessionIdParameter } = useLocalSearchParams<FinishingParameters>();
  const sessionId = Number(sessionIdParameter);
  const lookup = useFinishedSession(sessionId);

  const presentation =
    lookup.status === 'found'
      ? chooseStableFinishingPresentation(sessionId, {
          workoutKind: lookup.session.workoutKind,
          classType: lookup.session.classType,
          personalRecordCount: countExercisesWithRecords(lookup.personalRecords),
        })
      : null;

  const openSummary = useCallback(() => {
    router.replace({ pathname: '/sessions/[sessionId]/summary', params: { sessionId: sessionIdParameter } });
  }, [sessionIdParameter]);

  return (
    <Box flex={1} background="background">
      <NuggieLoadingScreen
        nuggie={presentation?.nuggie ?? 'celebrate'}
        caption={presentation?.caption ?? fallbackCaption}
        isReady={lookup.status !== 'loading'}
        onFinished={openSummary}
      />
    </Box>
  );
}
