import type { Topic } from '@/coach/Topic';

export const topicFallbacks: Record<Topic, string> = {
  progress: 'Noop!',
  improvement: 'Nothing stands out to fix right now — keep it up!',
  changeItUp: 'Your routine still has plenty in the tank. Stick with it!',
  recovery: 'Recovery looks steady. Listen to your body and keep going!',
  week: 'Everything looks on track — keep it up!',
};

export const openingFallback = 'Everything looks on track — keep it up!';
