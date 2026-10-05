import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import type { Insight } from '@/coach/Insight';
import {
  averageRestingHeartRateBeforeToday,
  averageSleepMinutes,
  lastNightSleepMinutes,
  restingHeartRateAverageDayCount,
  todayRestingHeartRate,
} from '@/coach/recoveryReadings';
import { lowSleepAverageMinutes, lowSleepAverageNightCount } from '@/coach/rules/lowSleep';

export const recoveryGoodPriority = 35;
export const recoveryGoodSleepMinutes = 420;

export function recoveryGood(snapshot: CoachSnapshot): Insight[] {
  const sleepMinutes = lastNightSleepMinutes(snapshot);
  const restingHeartRate = todayRestingHeartRate(snapshot);
  const average = averageRestingHeartRateBeforeToday(snapshot, restingHeartRateAverageDayCount);
  const sleepAverage = averageSleepMinutes(snapshot, lowSleepAverageNightCount);
  if (sleepMinutes === null || restingHeartRate === null || average === null || sleepAverage === null) {
    return [];
  }
  if (sleepAverage < lowSleepAverageMinutes) {
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
