import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import { NuggieLoadingScreen } from '@/components/organisms/NuggieLoadingScreen';
import { Box } from '@/components/primitives/Box';
import { useFinishedSession } from '@/hooks/useFinishedSession';
import { countExercisesWithRecords } from '@/progress/detectPersonalRecords';
import { chooseFinishingPresentation } from '@/sessions/chooseFinishingNuggie';

type FinishingParameters = {
  sessionId: string;
};

const fallbackCaption = 'Workout complete!';

export default function FinishingScreen() {
  const { sessionId: sessionIdParameter } = useLocalSearchParams<FinishingParameters>();
  const lookup = useFinishedSession(Number(sessionIdParameter));
  const [chosenPresentation, setChosenPresentation] = useState<ReturnType<typeof chooseFinishingPresentation> | null>(
    null,
  );

  if (lookup.status === 'found' && chosenPresentation === null) {
    setChosenPresentation(
      chooseFinishingPresentation({
        workoutKind: lookup.session.workoutKind,
        classType: lookup.session.classType,
        personalRecordCount: countExercisesWithRecords(lookup.personalRecords),
      }),
    );
  }

  const isReady = lookup.status !== 'loading' && (lookup.status !== 'found' || chosenPresentation !== null);
  const nuggie = chosenPresentation?.nuggie;

  const openSummary = useCallback(() => {
    router.replace({
      pathname: '/sessions/[sessionId]/summary',
      params: nuggie === undefined ? { sessionId: sessionIdParameter } : { sessionId: sessionIdParameter, nuggie },
    });
  }, [nuggie, sessionIdParameter]);

  return (
    <Box flex={1} background="background">
      <NuggieLoadingScreen
        nuggie={chosenPresentation?.nuggie ?? 'celebrate'}
        caption={chosenPresentation?.caption ?? fallbackCaption}
        isReady={isReady}
        onFinished={openSummary}
      />
    </Box>
  );
}
