import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import type { Insight } from '@/coach/Insight';
import { averageRestingHeartRateBeforeToday, todayRestingHeartRate } from '@/coach/recoveryReadings';

export const elevatedRestingHeartRatePriority = 85;
export const elevatedRestingHeartRateBeatsPerMinute = 5;
export const restingHeartRateAverageDayCount = 7;

export function elevatedRestingHeartRate(snapshot: CoachSnapshot): Insight[] {
  const today = todayRestingHeartRate(snapshot);
  const average = averageRestingHeartRateBeforeToday(snapshot, restingHeartRateAverageDayCount);
  if (today === null || average === null) {
    return [];
  }
  const difference = Math.round(today - average);
  if (today - average < elevatedRestingHeartRateBeatsPerMinute) {
    return [];
  }
  return [
    {
      ruleIdentifier: 'elevatedRestingHeartRate',
      topics: ['recovery'],
      priority: elevatedRestingHeartRatePriority,
      nuggie: 'tired',
      messages: [`Resting HR is up ${difference} bpm. Possible fatigue. Consider yoga or a rest day.`],
      action: null,
    },
  ];
}
