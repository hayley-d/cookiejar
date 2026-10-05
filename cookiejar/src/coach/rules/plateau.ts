import type { CoachSnapshot, FinishedSessionWithSets } from '@/coach/CoachSnapshot';
import { chooseVariant } from '@/coach/chooseVariant';
import type { Insight } from '@/coach/Insight';
import { describeBestSet, describePlateauAdvice, type PlateauSituation } from '@/coach/plateauPrescription';
import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { toLocalDateString } from '@/dates/toLocalDateString';
import {
  estimateOneRepMax,
  isWeightedSet,
  maximumRepetitionsForOneRepMaxEstimate,
  type CompletedSet,
} from '@/progress/detectPersonalRecords';
import type { Exercise } from '@/types/Exercise';

export const plateauPriority = 60;
export const minimumSessionsForPlateau = 4;
export const minimumWeeksForPlateau = 4;
export const sessionsAveragedForCurrentTraining = 3;
export const plateauWindowWeekCount = 6;
export const maximumListedPlateaus = 3;

const daysPerWeek = 7;
const millisecondsPerDay = 24 * 60 * 60 * 1000;

type MetricKind = 'estimatedOneRepMax' | 'heaviestHighRepetitionWeight' | 'repetitions' | 'duration' | 'distance';

type SessionBest = {
  startedAt: string;
  bestValue: number;
  bestSet: CompletedSet;
  matchingSets: CompletedSet[];
};

type Plateau = { exerciseId: number; weekCount: number; situation: Omit<PlateauSituation, 'exerciseName' | 'goal'> };

function windowStartTime(weekStartDate: string): number {
  return addDays(parseLocalDateString(weekStartDate), -(plateauWindowWeekCount - 1) * daysPerWeek).getTime();
}

function metricOf(set: CompletedSet): { metricKind: MetricKind; value: number } | null {
  switch (set.trackingType) {
    case 'repetitions_and_weight':
      if (!isWeightedSet(set)) {
        return null;
      }
      return set.repetitions > maximumRepetitionsForOneRepMaxEstimate
        ? { metricKind: 'heaviestHighRepetitionWeight', value: set.weightKilograms }
        : { metricKind: 'estimatedOneRepMax', value: estimateOneRepMax(set.weightKilograms, set.repetitions) };
    case 'repetitions':
      return set.repetitions === null ? null : { metricKind: 'repetitions', value: set.repetitions };
    case 'duration':
      return set.durationSeconds === null ? null : { metricKind: 'duration', value: set.durationSeconds };
    case 'distance':
      return set.distanceMeters === null ? null : { metricKind: 'distance', value: set.distanceMeters };
  }
}

function collectSessionBests(
  sessions: readonly FinishedSessionWithSets[],
  windowStart: number,
): Map<number, Map<MetricKind, SessionBest[]>> {
  const bestsByExerciseId = new Map<number, Map<MetricKind, SessionBest[]>>();
  for (const session of sessions) {
    if (new Date(session.startedAt).getTime() < windowStart) {
      continue;
    }
    const bestByKey = new Map<string, { exerciseId: number; metricKind: MetricKind; best: SessionBest }>();
    for (const set of session.sets) {
      const metric = metricOf(set);
      if (metric === null) {
        continue;
      }
      const key = `${set.exerciseId}:${metric.metricKind}`;
      const current = bestByKey.get(key);
      if (current === undefined) {
        bestByKey.set(key, {
          exerciseId: set.exerciseId,
          metricKind: metric.metricKind,
          best: { startedAt: session.startedAt, bestValue: metric.value, bestSet: set, matchingSets: [set] },
        });
        continue;
      }
      current.best.matchingSets.push(set);
      if (metric.value > current.best.bestValue) {
        current.best.bestValue = metric.value;
        current.best.bestSet = set;
      }
    }
    for (const { exerciseId, metricKind, best } of bestByKey.values()) {
      const bestsByMetricKind = bestsByExerciseId.get(exerciseId) ?? new Map<MetricKind, SessionBest[]>();
      bestsByMetricKind.set(metricKind, [...(bestsByMetricKind.get(metricKind) ?? []), best]);
      bestsByExerciseId.set(exerciseId, bestsByMetricKind);
    }
  }
  return bestsByExerciseId;
}

function average(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function describeRecentTraining(chronological: readonly SessionBest[]): Plateau['situation'] {
  const recentSessions = chronological.slice(-sessionsAveragedForCurrentTraining);
  const recentRepetitions = recentSessions.flatMap((session) =>
    session.matchingSets.map((set) => set.repetitions ?? 0),
  );
  const bestSession = chronological.reduce((best, session) => (session.bestValue > best.bestValue ? session : best));
  return {
    bestSet: bestSession.bestSet,
    averageSetCount: Math.round(average(recentSessions.map((session) => session.matchingSets.length))),
    averageRepetitions: Math.round(average(recentRepetitions)),
  };
}

function calendarDaysBetween(earlierStartedAt: string, laterStartedAt: string): number {
  const earlier = parseLocalDateString(toLocalDateString(new Date(earlierStartedAt)));
  const later = parseLocalDateString(toLocalDateString(new Date(laterStartedAt)));
  return Math.round((later.getTime() - earlier.getTime()) / millisecondsPerDay);
}

function findPlateaus(snapshot: CoachSnapshot): Plateau[] {
  const bestsByExerciseId = collectSessionBests(
    snapshot.sessionsLastTwelveWeeks,
    windowStartTime(snapshot.weekStartDate),
  );
  const plateaus: Plateau[] = [];
  for (const [exerciseId, bestsByMetricKind] of bestsByExerciseId) {
    for (const sessionBests of bestsByMetricKind.values()) {
      if (sessionBests.length < minimumSessionsForPlateau) {
        continue;
      }
      const chronological = [...sessionBests].sort(
        (first, second) => new Date(first.startedAt).getTime() - new Date(second.startedAt).getTime(),
      );
      const first = chronological[0];
      const last = chronological[chronological.length - 1];
      const dayCount = calendarDaysBetween(first.startedAt, last.startedAt);
      if (dayCount < minimumWeeksForPlateau * daysPerWeek) {
        continue;
      }
      if (last.bestValue <= first.bestValue) {
        plateaus.push({
          exerciseId,
          weekCount: Math.floor(dayCount / daysPerWeek),
          situation: describeRecentTraining(chronological),
        });
      }
    }
  }
  return plateaus.sort((first, second) => second.weekCount - first.weekCount);
}

export function plateau(snapshot: CoachSnapshot): Insight[] {
  const seenExerciseIds = new Set<number>();
  const listedPlateaus: { exercise: Exercise; weekCount: number; situation: Plateau['situation'] }[] = [];
  for (const foundPlateau of findPlateaus(snapshot)) {
    const exercise = snapshot.exercisesById.get(foundPlateau.exerciseId);
    if (exercise === undefined || seenExerciseIds.has(exercise.id)) {
      continue;
    }
    seenExerciseIds.add(exercise.id);
    listedPlateaus.push({ exercise, weekCount: foundPlateau.weekCount, situation: foundPlateau.situation });
  }
  listedPlateaus.splice(maximumListedPlateaus);
  if (listedPlateaus.length === 0) {
    return [];
  }
  return [
    {
      ruleIdentifier: 'plateau',
      topics: ['changeItUp', 'improvement'],
      priority: plateauPriority,
      nuggie: 'coach',
      messages: listedPlateaus.map(({ exercise, weekCount, situation }) => {
        const bestSetText = describeBestSet(situation.bestSet);
        const advice = describePlateauAdvice({
          ...situation,
          exerciseName: exercise.name,
          goal: snapshot.profile?.goal ?? null,
        });
        return chooseVariant(snapshot.now, [
          `Not noopy! ${exercise.name}'s been stuck at ${bestSetText} for ${weekCount} weeks. ${advice}`,
          `Ohh noops, ${exercise.name} hasn't moved past ${bestSetText} in ${weekCount} weeks. ${advice}`,
        ]);
      }),
      action: {
        label: `See ${listedPlateaus[0].exercise.name} history`,
        destination: { screen: 'exerciseHistory', exerciseId: listedPlateaus[0].exercise.id },
      },
    },
  ];
}
