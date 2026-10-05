import type { Topic } from '@/coach/Topic';

export type CoachQuestion = {
  topic: Topic;
  prompt: string;
};

export const coachQuestions: readonly CoachQuestion[] = [
  { topic: 'progress', prompt: 'How am I progressing?' },
  { topic: 'improvement', prompt: 'Where can I improve?' },
  { topic: 'changeItUp', prompt: 'Should I change things up?' },
  { topic: 'recovery', prompt: "How's my recovery?" },
  { topic: 'week', prompt: "What's my week looking like?" },
];
