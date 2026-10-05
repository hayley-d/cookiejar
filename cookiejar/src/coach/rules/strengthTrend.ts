import type { CoachSnapshot, FinishedSessionWithSets } from '@/coach/CoachSnapshot';
import type { Insight } from '@/coach/Insight';
import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { toLocalDateString } from '@/dates/toLocalDateString';
import {
  estimateOneRepMax,
  isWeightedSet,
  maximumRepetitionsForOneRepMaxEstimate,
} from '@/progress/detectPersonalRecords';

export const strengthTrendPriority = 30;
export const strengthTrendWindowWeekCount = 8;
export const minimumSessionsForStrengthTrend = 4;
export const minimumOneRepMaxRisePercent = 2.5;
export const maximumListedStrengthTrends = 3;

const daysPerWeek = 7;
const floatingPointTolerance = 1e-9;

type SessionEstimate = { startedAt: string; bestOneRepMax: number };

type StrengthTrend = { exerciseId: number; risePercent: number };

function windowStartTime(weekStartDate: string): number {
  const windowStart = addDays(parseLocalDateString(weekStartDate), -(strengthTrendWindowWeekCount - 1) * daysPerWeek);
  return parseLocalDateString(toLocalDateString(windowStart)).getTime();
}

function collectSessionEstimates(
  sessions: readonly FinishedSessionWithSets[],
  windowStart: number,
): Map<number, SessionEstimate[]> {
  const estimatesByExerciseId = new Map<number, SessionEstimate[]>();
  for (const session of sessions) {
    if (new Date(session.startedAt).getTime() < windowStart) {
      continue;
    }
    const bestByExerciseId = new Map<number, number>();
    for (const set of session.sets) {
      if (!isWeightedSet(set) || set.repetitions > maximumRepetitionsForOneRepMaxEstimate) {
        continue;
      }
      const estimate = estimateOneRepMax(set.weightKilograms, set.repetitions);
      bestByExerciseId.set(set.exerciseId, Math.max(bestByExerciseId.get(set.exerciseId) ?? 0, estimate));
    }
    for (const [exerciseId, bestOneRepMax] of bestByExerciseId) {
      const estimates = estimatesByExerciseId.get(exerciseId) ?? [];
      estimates.push({ startedAt: session.startedAt, bestOneRepMax });
      estimatesByExerciseId.set(exerciseId, estimates);
    }
  }
  return estimatesByExerciseId;
}

function findStrengthTrends(snapshot: CoachSnapshot): StrengthTrend[] {
  const estimatesByExerciseId = collectSessionEstimates(
    snapshot.sessionsLastTwelveWeeks,
    windowStartTime(snapshot.weekStartDate),
  );
  const strengthTrends: StrengthTrend[] = [];
  for (const [exerciseId, estimates] of estimatesByExerciseId) {
    if (estimates.length < minimumSessionsForStrengthTrend) {
      continue;
    }
    const chronological = [...estimates].sort(
      (first, second) => new Date(first.startedAt).getTime() - new Date(second.startedAt).getTime(),
    );
    const first = chronological[0].bestOneRepMax;
    const last = chronological[chronological.length - 1].bestOneRepMax;
    const risePercent = ((last - first) / first) * 100;
    if (risePercent >= minimumOneRepMaxRisePercent - floatingPointTolerance) {
      strengthTrends.push({ exerciseId, risePercent });
    }
  }
  return strengthTrends.sort((first, second) => second.risePercent - first.risePercent);
}

export function strengthTrend(snapshot: CoachSnapshot): Insight[] {
  const listedTrends = findStrengthTrends(snapshot)
    .flatMap((trend) => {
      const exercise = snapshot.exercisesById.get(trend.exerciseId);
      return exercise === undefined ? [] : [{ exercise, risePercent: trend.risePercent }];
    })
    .slice(0, maximumListedStrengthTrends);
  if (listedTrends.length === 0) {
    return [];
  }
  return [
    {
      ruleIdentifier: 'strengthTrend',
      topics: ['progress'],
      priority: strengthTrendPriority,
      nuggie: 'analytics',
      messages: listedTrends.map(
        ({ exercise, risePercent }) =>
          `Ohh my noops, ${exercise.name} up ${Math.round(risePercent)}% in ${strengthTrendWindowWeekCount} weeks 📈`,
      ),
      action: {
        label: `See ${listedTrends[0].exercise.name} history`,
        destination: {
          screen: 'exerciseHistory',
          exerciseId: listedTrends[0].exercise.id,
        },
      },
    },
  ];
}
