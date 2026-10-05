import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import { chooseVariant } from '@/coach/chooseVariant';
import type { Insight } from '@/coach/Insight';
import {
  averageRestingHeartRateBeforeToday,
  restingHeartRateAverageDayCount,
  todayRestingHeartRate,
} from '@/coach/recoveryReadings';
import { todaysTraining, type TodaysTraining } from '@/coach/todaysTraining';

export const elevatedRestingHeartRatePriority = 85;
export const elevatedRestingHeartRateBeatsPerMinute = 5;

function heartRateAdvice(training: TodaysTraining, isFirstVariant: boolean): string {
  switch (training.kind) {
    case 'upcoming':
      return isFirstVariant
        ? `Swap ${training.workoutName} for yoga or a rest day?`
        : `Go easy on ${training.workoutName}.`;
    case 'trainedAlready':
      return 'Rest up tonight.';
    case 'restDay':
      return 'Perfect day for yoga or a rest.';
  }
}

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
  const training = todaysTraining(snapshot);
  return [
    {
      ruleIdentifier: 'elevatedRestingHeartRate',
      topics: ['recovery'],
      priority: elevatedRestingHeartRatePriority,
      nuggie: 'tired',
      messages: [
        chooseVariant(snapshot.now, [
          `Resting HR is up ${difference} bpm. Not noopy, could be fatigue. ${heartRateAdvice(training, true)}`,
          `Your heart's working ${difference} bpm harder than usual at rest. ${heartRateAdvice(training, false)}`,
        ]),
      ],
      action: null,
    },
  ];
}
