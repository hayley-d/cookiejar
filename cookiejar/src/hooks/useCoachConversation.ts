import { useCallback, useEffect, useReducer, useRef } from 'react';

import { answerQuestion, openingBubbles } from '@/coach/answerQuestion';
import {
  coachTypingDelayMilliseconds,
  conversationReducer,
  initialConversationState,
  isTyping,
} from '@/coach/coachConversation';
import type { CoachQuestion } from '@/coach/coachQuestions';
import type { CoachSnapshot } from '@/coach/CoachSnapshot';

export function useCoachConversation(snapshot: CoachSnapshot | null) {
  const [state, dispatch] = useReducer(conversationReducer, initialConversationState);
  const hasOpenedReference = useRef(false);

  useEffect(() => {
    if (snapshot === null || hasOpenedReference.current) {
      return;
    }
    hasOpenedReference.current = true;
    dispatch({ type: 'opened', bubbles: openingBubbles(snapshot) });
  }, [snapshot]);

  useEffect(() => {
    if (state.queuedBubbles.length === 0) {
      return;
    }
    const timeout = setTimeout(() => dispatch({ type: 'nextBubbleRevealed' }), coachTypingDelayMilliseconds);
    return () => clearTimeout(timeout);
  }, [state.queuedBubbles]);

  const askQuestion = useCallback(
    (question: CoachQuestion) => {
      if (snapshot === null) {
        return;
      }
      dispatch({ type: 'questionAsked', prompt: question.prompt, bubbles: answerQuestion(question, snapshot) });
    },
    [snapshot],
  );

  return {
    messages: state.messages,
    isTyping: isTyping(state),
    typingNuggie: state.queuedBubbles[0]?.nuggie ?? null,
    askQuestion,
  };
}
