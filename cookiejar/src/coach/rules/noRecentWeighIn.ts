import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import { chooseVariant } from '@/coach/chooseVariant';
import type { Insight } from '@/coach/Insight';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import type { FitnessGoal } from '@/types/Profile';

export const noRecentWeighInPriority = 40;
export const weighInStaleDayCount = 14;

const goalLabels: Partial<Record<FitnessGoal, string>> = {
  weight_loss: 'weight loss',
  hypertrophy: 'muscle gain',
};
const millisecondsPerDay = 24 * 60 * 60 * 1000;

export function noRecentWeighIn(snapshot: CoachSnapshot): Insight[] {
  const goal = snapshot.profile?.goal ?? null;
  const goalLabel = goal === null ? undefined : goalLabels[goal];
  if (goalLabel === undefined) {
    return [];
  }
  const latestMeasurement = snapshot.latestBodyMeasurement;
  let message = `No weigh-ins yet! Add one so I can track your ${goalLabel}.`;
  if (latestMeasurement !== null) {
    const dayCount = Math.round(
      (parseLocalDateString(snapshot.today).getTime() - parseLocalDateString(latestMeasurement.measuredOn).getTime()) /
        millisecondsPerDay,
    );
    if (dayCount <= weighInStaleDayCount) {
      return [];
    }
    message = chooseVariant(snapshot.now, [
      `No weigh-in for ${dayCount} days. Log one so I can see how your ${goalLabel} is going!`,
      `Psst, last weigh-in was ${dayCount} days ago. Hop on the scales so I can track your ${goalLabel}.`,
    ]);
  }
  return [
    {
      ruleIdentifier: 'noRecentWeighIn',
      topics: ['improvement'],
      priority: noRecentWeighInPriority,
      nuggie: 'coach',
      messages: [message],
      action: {
        label: 'Add measurement',
        destination: { screen: 'addMeasurement' },
      },
    },
  ];
}
