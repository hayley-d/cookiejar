import { useRef } from 'react';

import type { InsightAction } from '@/coach/Insight';
import type { ConversationMessage } from '@/coach/coachConversation';
import { TypingIndicator } from '@/components/atoms/TypingIndicator';
import { CoachMessageBubble } from '@/components/molecules/CoachMessageBubble';
import { UserMessageBubble } from '@/components/molecules/UserMessageBubble';
import { AnimatedBox } from '@/components/primitives/AnimatedBox';
import { ScrollBox, type ScrollBoxHandle } from '@/components/primitives/ScrollBox';

type CoachConversationProperties = {
  messages: readonly ConversationMessage[];
  isTyping: boolean;
  onActionPress: (action: InsightAction) => void;
};

export function CoachConversation({ messages, isTyping, onActionPress }: CoachConversationProperties) {
  const scrollReference = useRef<ScrollBoxHandle>(null);

  return (
    <ScrollBox
      ref={scrollReference}
      gap="small"
      onContentSizeChange={() => scrollReference.current?.scrollToEnd({ animated: true })}
    >
      {messages.map((message) => {
        if (message.author === 'user') {
          return (
            <AnimatedBox key={message.identifier} motion="rise">
              <UserMessageBubble text={message.text} />
            </AnimatedBox>
          );
        }
        const { action } = message.bubble;
        return (
          <AnimatedBox key={message.identifier} motion="rise">
            <CoachMessageBubble
              text={message.bubble.text}
              actionLabel={action?.label}
              onActionPress={action ? () => onActionPress(action) : undefined}
            />
          </AnimatedBox>
        );
      })}
      {isTyping ? (
        <CoachMessageBubble>
          <TypingIndicator />
        </CoachMessageBubble>
      ) : null}
    </ScrollBox>
  );
}
