import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import { chooseVariant } from '@/coach/chooseVariant';
import type { Insight } from '@/coach/Insight';
import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { isWeightedSet } from '@/progress/detectPersonalRecords';

export const trainingLoadSpikePriority = 65;
export const trainingLoadSpikeMultiplier = 1.5;
export const trainingLoadComparisonWeekCount = 4;

const daysPerWeek = 7;

function sessionVolume(snapshot: CoachSnapshot, startTime: number, endTime: number): number {
  let volume = 0;
  for (const session of snapshot.sessionsLastTwelveWeeks) {
    const startedTime = new Date(session.startedAt).getTime();
    if (startedTime < startTime || startedTime >= endTime) {
      continue;
    }
    for (const set of session.sets) {
      if (isWeightedSet(set)) {
        volume += set.weightKilograms * set.repetitions;
      }
    }
  }
  return volume;
}

export function trainingLoadSpike(snapshot: CoachSnapshot): Insight[] {
  const weekStart = parseLocalDateString(snapshot.weekStartDate);
  const weekStartTime = weekStart.getTime();
  const comparisonStartTime = addDays(weekStart, -trainingLoadComparisonWeekCount * daysPerWeek).getTime();
  const thisWeekVolume = sessionVolume(snapshot, weekStartTime, Number.POSITIVE_INFINITY);
  const previousAverageVolume =
    sessionVolume(snapshot, comparisonStartTime, weekStartTime) / trainingLoadComparisonWeekCount;
  if (previousAverageVolume <= 0 || thisWeekVolume <= previousAverageVolume * trainingLoadSpikeMultiplier) {
    return [];
  }
  const risePercent = Math.round((thisWeekVolume / previousAverageVolume - 1) * 100);
  return [
    {
      ruleIdentifier: 'trainingLoadSpike',
      topics: ['recovery'],
      priority: trainingLoadSpikePriority,
      nuggie: 'coach',
      messages: [
        chooseVariant(snapshot.now, [
          `${risePercent}% more volume than your usual week. Not noopy for your joints, watch for niggles.`,
          `Big jump! ${risePercent}% more volume this week than usual. Ease in and watch for niggles.`,
        ]),
      ],
      action: null,
    },
  ];
}
