import { router, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { coachQuestions } from '@/coach/coachQuestions';
import type { CoachDestination, InsightAction } from '@/coach/Insight';
import { EmptyState } from '@/components/molecules/EmptyState';
import { CoachConversation } from '@/components/organisms/CoachConversation';
import { PromptChipBar } from '@/components/organisms/PromptChipBar';
import { Box } from '@/components/primitives/Box';
import { useCoachConversation } from '@/hooks/useCoachConversation';
import { useCoachSnapshot } from '@/hooks/useCoachSnapshot';

function hrefForDestination(destination: CoachDestination): Href {
  switch (destination.screen) {
    case 'exerciseHistory':
      return { pathname: '/progress/exercises/[exerciseId]', params: { exerciseId: destination.exerciseId } };
    case 'planEditor':
      return { pathname: '/plans/[planId]', params: { planId: destination.planId } };
    case 'addMeasurement':
      return '/profile/measurements/new';
    case 'calendar':
      return '/calendar';
    case 'exerciseLibrary':
      return { pathname: '/exercises', params: { bodyPart: destination.bodyPart } };
  }
}

function openAction(action: InsightAction) {
  router.dismiss();
  router.navigate(hrefForDestination(action.destination));
}

export default function CoachScreen() {
  const snapshotLookup = useCoachSnapshot();
  const snapshot = snapshotLookup.status === 'ready' ? snapshotLookup.snapshot : null;
  const { messages, isTyping, askQuestion } = useCoachConversation(snapshot);

  if (snapshotLookup.status === 'failed') {
    return (
      <Box flex={1} background="background">
        <EmptyState
          nuggie="tired"
          title="Coach Nuggie is stuck"
          message="I couldn't read your training just now. Close the coach and try again."
          actionLabel="Close"
          onAction={() => router.dismiss()}
        />
      </Box>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <Box flex={1} background="background">
        <Box flex={1}>
          <CoachConversation
            messages={messages}
            isTyping={snapshot === null || isTyping}
            onActionPress={openAction}
          />
        </Box>
        <Box borderColor="border" style={{ borderWidth: 0, borderTopWidth: 1 }}>
          <PromptChipBar questions={coachQuestions} isLocked={snapshot === null || isTyping} onAsk={askQuestion} />
        </Box>
      </Box>
    </SafeAreaView>
  );
}
