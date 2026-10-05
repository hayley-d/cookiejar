import { useRef } from 'react';

import type { InsightAction } from '@/coach/Insight';
import type { ConversationMessage } from '@/coach/coachConversation';
import { TypingIndicator } from '@/components/atoms/TypingIndicator';
import { CoachMessageBubble } from '@/components/molecules/CoachMessageBubble';
import { UserMessageBubble } from '@/components/molecules/UserMessageBubble';
import { AnimatedBox } from '@/components/primitives/AnimatedBox';
import { ScrollBox, type ScrollBoxHandle } from '@/components/primitives/ScrollBox';
import type { NuggieName } from '@/nuggies/NuggieName';

type CoachConversationProperties = {
  messages: readonly ConversationMessage[];
  typingNuggie: NuggieName | null;
  onActionPress: (action: InsightAction) => void;
};

export function CoachConversation({ messages, typingNuggie, onActionPress }: CoachConversationProperties) {
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
              nuggie={message.bubble.nuggie}
              text={message.bubble.text}
              actionLabel={action?.label}
              onActionPress={action ? () => onActionPress(action) : undefined}
            />
          </AnimatedBox>
        );
      })}
      {typingNuggie ? (
        <CoachMessageBubble nuggie={typingNuggie}>
          <TypingIndicator />
        </CoachMessageBubble>
      ) : null}
    </ScrollBox>
  );
}
