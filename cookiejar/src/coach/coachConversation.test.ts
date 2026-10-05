import { describe, expect, test } from 'bun:test';

import type { CoachBubble } from '@/coach/CoachBubble';
import {
  coachTypingDelayMilliseconds,
  conversationReducer,
  initialConversationState,
  isTyping,
  type ConversationAction,
  type ConversationState,
} from '@/coach/coachConversation';

function bubble(text: string): CoachBubble {
  return { text, nuggie: 'coach', action: null };
}

function reduce(actions: ConversationAction[], state: ConversationState = initialConversationState) {
  return actions.reduce(conversationReducer, state);
}

const revealNext: ConversationAction = { type: 'nextBubbleRevealed' };

describe('conversationReducer', () => {
  test('the typing delay is 400 ms', () => {
    expect(coachTypingDelayMilliseconds).toBe(400);
  });

  test('starts empty and not typing', () => {
    expect(initialConversationState.messages).toEqual([]);
    expect(isTyping(initialConversationState)).toBe(false);
  });

  test('opening queues the greeting bubbles and types before showing any', () => {
    const state = reduce([{ type: 'opened', bubbles: [bubble('Morning!'), bubble('Second')] }]);
    expect(state.messages).toEqual([]);
    expect(isTyping(state)).toBe(true);
  });

  test('reveals queued bubbles one at a time in order, then stops typing', () => {
    const opened = reduce([{ type: 'opened', bubbles: [bubble('Morning!'), bubble('Second')] }]);
    const afterFirst = conversationReducer(opened, revealNext);
    expect(afterFirst.messages.map((message) => message.author === 'coach' && message.bubble.text)).toEqual([
      'Morning!',
    ]);
    expect(isTyping(afterFirst)).toBe(true);
    const afterSecond = conversationReducer(afterFirst, revealNext);
    expect(afterSecond.messages.map((message) => message.author === 'coach' && message.bubble.text)).toEqual([
      'Morning!',
      'Second',
    ]);
    expect(isTyping(afterSecond)).toBe(false);
  });

  test('revealing with nothing queued changes nothing', () => {
    expect(conversationReducer(initialConversationState, revealNext)).toBe(initialConversationState);
  });

  test('a question adds the user bubble at once and queues the answer', () => {
    const settled = reduce([{ type: 'opened', bubbles: [bubble('Morning!')] }, revealNext]);
    const asked = conversationReducer(settled, {
      type: 'questionAsked',
      prompt: "What's my week looking like?",
      bubbles: [bubble('Week one'), bubble('Week two')],
    });
    expect(asked.messages.at(-1)).toMatchObject({ author: 'user', text: "What's my week looking like?" });
    expect(isTyping(asked)).toBe(true);
    const answered = reduce([revealNext, revealNext], asked);
    expect(answered.messages.map((message) => message.author)).toEqual(['coach', 'user', 'coach', 'coach']);
    expect(isTyping(answered)).toBe(false);
  });

  test('a question is ignored while an answer is still typing', () => {
    const typing = reduce([{ type: 'opened', bubbles: [bubble('Morning!')] }]);
    const ignored = conversationReducer(typing, { type: 'questionAsked', prompt: 'Again?', bubbles: [bubble('No')] });
    expect(ignored).toBe(typing);
  });

  test('each message gets a unique identifier', () => {
    const state = reduce([
      { type: 'opened', bubbles: [bubble('Morning!')] },
      revealNext,
      { type: 'questionAsked', prompt: 'Question', bubbles: [bubble('Answer')] },
      revealNext,
    ]);
    const identifiers = state.messages.map((message) => message.identifier);
    expect(new Set(identifiers).size).toBe(identifiers.length);
  });

  test('opening again resets the conversation', () => {
    const state = reduce([
      { type: 'opened', bubbles: [bubble('Morning!')] },
      revealNext,
      { type: 'opened', bubbles: [bubble('Fresh')] },
    ]);
    expect(state.messages).toEqual([]);
    expect(state.queuedBubbles).toEqual([bubble('Fresh')]);
  });
});
