import type { InsightAction } from '@/coach/Insight';
import type { NuggieName } from '@/nuggies/NuggieName';

export type CoachBubble = {
  text: string;
  nuggie: NuggieName;
  action: InsightAction | null;
};
