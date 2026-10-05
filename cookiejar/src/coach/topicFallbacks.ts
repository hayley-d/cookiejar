import type { Topic } from '@/coach/Topic';

export const topicFallbacks: Record<Topic, string> = {
  progress: 'Noop!',
  improvement: 'Everything is very noopy, nothing from me right now!',
  changeItUp: "Your routine's still very noopy. Stick with it!",
  recovery: 'Recovery looks noopy. Listen to your body and keep going!',
  week: 'Everything looks on track — keep it up!',
};

export const openingFallback = 'Everything looks on track — keep it up!';
