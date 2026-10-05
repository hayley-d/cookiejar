import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import type { Insight } from '@/coach/Insight';
import { averageSleepMinutes, lastNightSleepMinutes } from '@/coach/recoveryReadings';
import { formatSleepMinutes } from '@/health/formatSleepMinutes';

export const lowSleepPriority = 90;
export const lowSleepLastNightMinutes = 360;
export const lowSleepAverageMinutes = 390;
export const lowSleepAverageNightCount = 3;

export function lowSleep(snapshot: CoachSnapshot): Insight[] {
  const lastNight = lastNightSleepMinutes(snapshot);
  const average = averageSleepMinutes(snapshot, lowSleepAverageNightCount);
  const isLastNightLow = lastNight !== null && lastNight < lowSleepLastNightMinutes;
  const isAverageLow = average !== null && average < lowSleepAverageMinutes;
  if (!isLastNightLow && !isAverageLow) {
    return [];
  }
  const message = isLastNightLow
    ? `Only ${formatSleepMinutes(lastNight)} sleep. Go lighter today.`
    : `Your last ${lowSleepAverageNightCount} nights averaged ${formatSleepMinutes(average)} of sleep. Go lighter today.`;
  return [
    {
      ruleIdentifier: 'lowSleep',
      topics: ['recovery'],
      priority: lowSleepPriority,
      nuggie: 'tired',
      messages: [message],
      action: { label: "Today's plan", destination: { screen: 'calendar' } },
    },
  ];
}
