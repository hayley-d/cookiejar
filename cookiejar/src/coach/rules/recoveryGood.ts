import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import type { Insight } from '@/coach/Insight';
import {
  averageRestingHeartRateBeforeToday,
  lastNightSleepMinutes,
  todayRestingHeartRate,
} from '@/coach/recoveryReadings';
import { restingHeartRateAverageDayCount } from '@/coach/rules/elevatedRestingHeartRate';

export const recoveryGoodPriority = 35;
export const recoveryGoodSleepMinutes = 420;

export function recoveryGood(snapshot: CoachSnapshot): Insight[] {
  const sleepMinutes = lastNightSleepMinutes(snapshot);
  const restingHeartRate = todayRestingHeartRate(snapshot);
  const average = averageRestingHeartRateBeforeToday(snapshot, restingHeartRateAverageDayCount);
  if (sleepMinutes === null || restingHeartRate === null || average === null) {
    return [];
  }
  if (sleepMinutes < recoveryGoodSleepMinutes || restingHeartRate > average) {
    return [];
  }
  return [
    {
      ruleIdentifier: 'recoveryGood',
      topics: ['recovery'],
      priority: recoveryGoodPriority,
      nuggie: 'beast',
      messages: ['Well rested. Great day to push for a record!'],
      action: null,
    },
  ];
}
