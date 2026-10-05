import type { CoachQuestion } from '@/coach/coachQuestions';
import { PromptChip } from '@/components/molecules/PromptChip';
import { ScrollBox } from '@/components/primitives/ScrollBox';

type PromptChipBarProperties = {
  questions: readonly CoachQuestion[];
  isLocked: boolean;
  onAsk: (question: CoachQuestion) => void;
};

export function PromptChipBar({ questions, isLocked, onAsk }: PromptChipBarProperties) {
  return (
    <ScrollBox horizontal showsHorizontalScrollIndicator={false} gap="small" contentInsetAdjustmentBehavior="never">
      {questions.map((question) => (
        <PromptChip key={question.topic} label={question.prompt} disabled={isLocked} onPress={() => onAsk(question)} />
      ))}
    </ScrollBox>
  );
}
