import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import type { Insight } from '@/coach/Insight';
import { parseLocalDateString } from '@/dates/parseLocalDateString';

export const stalePlanPriority = 55;
export const minimumStalePlanWeekCount = 6;

const daysPerWeek = 7;
const millisecondsPerDay = 24 * 60 * 60 * 1000;

export function stalePlan(snapshot: CoachSnapshot): Insight[] {
  const activePlan = snapshot.activePlan;
  if (activePlan === null || activePlan.startsOn === null) {
    return [];
  }
  const dayCount = Math.round(
    (parseLocalDateString(snapshot.today).getTime() - parseLocalDateString(activePlan.startsOn).getTime()) /
      millisecondsPerDay,
  );
  const weekCount = Math.floor(dayCount / daysPerWeek);
  if (weekCount < minimumStalePlanWeekCount) {
    return [];
  }
  return [
    {
      ruleIdentifier: 'stalePlan',
      topics: ['changeItUp'],
      priority: stalePlanPriority,
      nuggie: 'coach',
      messages: [
        `You've run ${activePlan.name} for ${weekCount} weeks. Time for a new phase? Duplicate it and tweak it.`,
      ],
      action: {
        label: 'Open plan',
        destination: { screen: 'planEditor', planId: activePlan.id },
      },
    },
  ];
}
