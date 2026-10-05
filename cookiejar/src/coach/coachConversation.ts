import type { CoachBubble } from '@/coach/CoachBubble';

export const coachTypingDelayMilliseconds = 400;

export type ConversationMessage =
  { identifier: number; author: 'coach'; bubble: CoachBubble } | { identifier: number; author: 'user'; text: string };

export type ConversationState = {
  messages: readonly ConversationMessage[];
  queuedBubbles: readonly CoachBubble[];
  nextIdentifier: number;
};

export type ConversationAction =
  | { type: 'opened'; bubbles: readonly CoachBubble[] }
  | { type: 'questionAsked'; prompt: string; bubbles: readonly CoachBubble[] }
  | { type: 'nextBubbleRevealed' };

export const initialConversationState: ConversationState = {
  messages: [],
  queuedBubbles: [],
  nextIdentifier: 1,
};

export function isTyping(state: ConversationState): boolean {
  return state.queuedBubbles.length > 0;
}

export function conversationReducer(state: ConversationState, action: ConversationAction): ConversationState {
  switch (action.type) {
    case 'opened':
      return { ...initialConversationState, queuedBubbles: action.bubbles };
    case 'questionAsked':
      if (isTyping(state)) {
        return state;
      }
      return {
        messages: [...state.messages, { identifier: state.nextIdentifier, author: 'user', text: action.prompt }],
        queuedBubbles: action.bubbles,
        nextIdentifier: state.nextIdentifier + 1,
      };
    case 'nextBubbleRevealed': {
      const [nextBubble, ...remainingBubbles] = state.queuedBubbles;
      if (nextBubble === undefined) {
        return state;
      }
      return {
        messages: [...state.messages, { identifier: state.nextIdentifier, author: 'coach', bubble: nextBubble }],
        queuedBubbles: remainingBubbles,
        nextIdentifier: state.nextIdentifier + 1,
      };
    }
  }
}
