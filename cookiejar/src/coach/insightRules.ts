import type { InsightRule } from '@/coach/Insight';
import { elevatedRestingHeartRate } from '@/coach/rules/elevatedRestingHeartRate';
import { lowSleep } from '@/coach/rules/lowSleep';
import { missedSessions } from '@/coach/rules/missedSessions';
import { muscleBalance } from '@/coach/rules/muscleBalance';
import { newPersonalRecords } from '@/coach/rules/newPersonalRecords';
import { noData } from '@/coach/rules/noData';
import { noRecentWeighIn } from '@/coach/rules/noRecentWeighIn';
import { plateau } from '@/coach/rules/plateau';
import { recoveryGood } from '@/coach/rules/recoveryGood';
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
  lowSleep,
  elevatedRestingHeartRate,
  recoveryGood,
  muscleBalance,
  noRecentWeighIn,
];
