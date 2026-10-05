import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import { chooseVariant } from '@/coach/chooseVariant';
import type { Insight } from '@/coach/Insight';
import { parseLocalDateString } from '@/dates/parseLocalDateString';

export const stalePlanPriority = 55;
export const minimumStalePlanWeekCount = 6;
export const deloadSuggestionWeekCount = 8;

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
        [
          chooseVariant(snapshot.now, [
            `Ohh my noops, ${weekCount} weeks of ${activePlan.name}! Time for a new phase? Duplicate it and tweak it.`,
            `${activePlan.name} has had a good ${weekCount}-week run. Duplicate it and switch things up for a noopy new phase.`,
          ]),
          ...(weekCount >= deloadSuggestionWeekCount ? ['Start with a deload week, then go fresh.'] : []),
        ].join(' '),
      ],
      action: {
        label: 'Open plan',
        destination: { screen: 'planEditor', planId: activePlan.id },
      },
    },
  ];
}
