import type { InsightRule } from '@/coach/Insight';
import { missedSessions } from '@/coach/rules/missedSessions';
import { newPersonalRecords } from '@/coach/rules/newPersonalRecords';
import { noData } from '@/coach/rules/noData';
import { plateau } from '@/coach/rules/plateau';
import { stalePlan } from '@/coach/rules/stalePlan';
import { streakMilestone } from '@/coach/rules/streakMilestone';
import { strengthTrend } from '@/coach/rules/strengthTrend';
import { trainingLoadSpike } from '@/coach/rules/trainingLoadSpike';
import { weekAhead } from '@/coach/rules/weekAhead';

export const insightRules: readonly InsightRule[] = [
  noData,
  newPersonalRecords,
  missedSessions,
  trainingLoadSpike,
  plateau,
  stalePlan,
  streakMilestone,
  strengthTrend,
  weekAhead,
];
