import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import type { Insight } from '@/coach/Insight';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import type { FitnessGoal } from '@/types/Profile';

export const noRecentWeighInPriority = 40;
export const weighInStaleDayCount = 14;

const goalsNeedingWeighIns: readonly FitnessGoal[] = ['weight_loss', 'hypertrophy'];
const millisecondsPerDay = 24 * 60 * 60 * 1000;

export function noRecentWeighIn(snapshot: CoachSnapshot): Insight[] {
  const goal = snapshot.profile?.goal ?? null;
  if (goal === null || !goalsNeedingWeighIns.includes(goal)) {
    return [];
  }
  const latestMeasurement = snapshot.latestBodyMeasurement;
  if (latestMeasurement !== null) {
    const dayCount = Math.round(
      (parseLocalDateString(snapshot.today).getTime() - parseLocalDateString(latestMeasurement.measuredOn).getTime()) /
        millisecondsPerDay,
    );
    if (dayCount <= weighInStaleDayCount) {
      return [];
    }
  }
  return [
    {
      ruleIdentifier: 'noRecentWeighIn',
      topics: ['improvement'],
      priority: noRecentWeighInPriority,
      nuggie: 'coach',
      messages: ['No weigh-in for 2 weeks. Log one so I can track your progress.'],
      action: {
        label: 'Add measurement',
        destination: { screen: 'addMeasurement' },
      },
    },
  ];
}
