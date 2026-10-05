import type { InsightRule } from '@/coach/Insight';
import { newPersonalRecords } from '@/coach/rules/newPersonalRecords';
import { noData } from '@/coach/rules/noData';
import { streakMilestone } from '@/coach/rules/streakMilestone';
import { strengthTrend } from '@/coach/rules/strengthTrend';
import { weekAhead } from '@/coach/rules/weekAhead';

export const insightRules: readonly InsightRule[] = [
  noData,
  newPersonalRecords,
  streakMilestone,
  strengthTrend,
  weekAhead,
];
