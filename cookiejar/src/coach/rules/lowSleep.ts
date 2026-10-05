import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import { chooseVariant } from '@/coach/chooseVariant';
import type { Insight } from '@/coach/Insight';
import { averageSleepMinutes, lastNightSleepMinutes } from '@/coach/recoveryReadings';
import { todaysTraining, type TodaysTraining } from '@/coach/todaysTraining';
import { formatSleepMinutes } from '@/health/formatSleepMinutes';

export const lowSleepPriority = 90;
export const lowSleepLastNightMinutes = 360;
export const lowSleepAverageMinutes = 390;
export const lowSleepAverageNightCount = 3;

function sleepOpening(snapshot: CoachSnapshot, sleepText: string, isLastNight: boolean): string {
  const lastNightOpenings = [`Not noopy, only ${sleepText} of sleep 😴`, `Oh noop, just ${sleepText} of sleep.`] as const;
  const averageOpenings = [
    `Not noopy, your last ${lowSleepAverageNightCount} nights averaged ${sleepText} of sleep 😴`,
    `Oh noop, your last ${lowSleepAverageNightCount} nights averaged just ${sleepText} of sleep.`,
  ] as const;
  return chooseVariant(snapshot.now, isLastNight ? lastNightOpenings : averageOpenings);
}

function sleepAdvice(snapshot: CoachSnapshot, training: TodaysTraining): string {
  switch (training.kind) {
    case 'upcoming':
      return chooseVariant(snapshot.now, [
        `${training.workoutName}'s on today, go lighter or drop a set.`,
        `Take ${training.workoutName} easy today.`,
      ]);
    case 'trainedAlready':
      return "You've already trained today, so rest up tonight.";
    case 'restDay':
      return "Good thing it's a rest day, take it easy.";
  }
}

export function lowSleep(snapshot: CoachSnapshot): Insight[] {
  const lastNight = lastNightSleepMinutes(snapshot);
  const average = averageSleepMinutes(snapshot, lowSleepAverageNightCount);
  const isLastNightLow = lastNight !== null && lastNight < lowSleepLastNightMinutes;
  const isAverageLow = average !== null && average < lowSleepAverageMinutes;
  if (!isLastNightLow && !isAverageLow) {
    return [];
  }
  const sleepText = isLastNightLow ? formatSleepMinutes(lastNight) : formatSleepMinutes(average);
  const message = `${sleepOpening(snapshot, sleepText, isLastNightLow)} ${sleepAdvice(snapshot, todaysTraining(snapshot))}`;
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
