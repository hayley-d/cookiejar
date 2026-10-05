import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import { chooseVariant } from '@/coach/chooseVariant';
import type { Insight } from '@/coach/Insight';
import {
  averageRestingHeartRateBeforeToday,
  averageSleepMinutes,
  lastNightSleepMinutes,
  restingHeartRateAverageDayCount,
  todayRestingHeartRate,
} from '@/coach/recoveryReadings';
import { lowSleepAverageMinutes, lowSleepAverageNightCount } from '@/coach/rules/lowSleep';
import { todaysTraining, type TodaysTraining } from '@/coach/todaysTraining';
import { formatSleepMinutes } from '@/health/formatSleepMinutes';

export const recoveryGoodPriority = 35;
export const recoveryGoodSleepMinutes = 420;

function recoveryGoodMessage(snapshot: CoachSnapshot, sleepText: string, training: TodaysTraining): string {
  switch (training.kind) {
    case 'upcoming':
      return chooseVariant(snapshot.now, [
        `Slept ${sleepText} and your heart's calm. Very noopy! Great day to push for a record on ${training.workoutName}!`,
        `Fully recharged 🔋 ${sleepText} of sleep. Go hunt a record today!`,
      ]);
    case 'trainedAlready':
      return chooseVariant(snapshot.now, [
        `Slept ${sleepText} and your heart's calm. Very noopy!`,
        `Fully recharged 🔋 ${sleepText} of sleep. Very noopy!`,
      ]);
    case 'restDay':
      return 'Very noopy recovery. Enjoy the rest day!';
  }
}

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
      messages: [recoveryGoodMessage(snapshot, formatSleepMinutes(sleepMinutes), todaysTraining(snapshot))],
      action: null,
    },
  ];
}
