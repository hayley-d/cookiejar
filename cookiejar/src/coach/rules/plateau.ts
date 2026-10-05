import type { CoachSnapshot, FinishedSessionWithSets } from '@/coach/CoachSnapshot';
import type { Insight } from '@/coach/Insight';
import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { toLocalDateString } from '@/dates/toLocalDateString';
import {
  estimateOneRepMax,
  isWeightedSet,
  maximumRepetitionsForOneRepMaxEstimate,
  type CompletedSet,
} from '@/progress/detectPersonalRecords';
import type { TrackingType } from '@/types/TrackingType';

export const plateauPriority = 60;
export const minimumSessionsForPlateau = 4;
export const minimumWeeksForPlateau = 3;
export const plateauWindowWeekCount = 6;
export const maximumListedPlateaus = 3;

const daysPerWeek = 7;
const millisecondsPerDay = 24 * 60 * 60 * 1000;

type SessionBest = { startedAt: string; bestValue: number };

type Plateau = { exerciseId: number; weekCount: number };

function windowStartTime(weekStartDate: string): number {
  return addDays(parseLocalDateString(weekStartDate), -(plateauWindowWeekCount - 1) * daysPerWeek).getTime();
}

function metricValueOf(set: CompletedSet): number | null {
  switch (set.trackingType) {
    case 'repetitions_and_weight':
      if (!isWeightedSet(set) || set.repetitions > maximumRepetitionsForOneRepMaxEstimate) {
        return null;
      }
      return estimateOneRepMax(set.weightKilograms, set.repetitions);
    case 'repetitions':
      return set.repetitions;
    case 'duration':
      return set.durationSeconds;
    case 'distance':
      return set.distanceMeters;
  }
}

function collectSessionBests(
  sessions: readonly FinishedSessionWithSets[],
  windowStart: number,
): Map<number, Map<TrackingType, SessionBest[]>> {
  const bestsByExerciseId = new Map<number, Map<TrackingType, SessionBest[]>>();
  for (const session of sessions) {
    if (new Date(session.startedAt).getTime() < windowStart) {
      continue;
    }
    const bestByKey = new Map<string, { exerciseId: number; trackingType: TrackingType; value: number }>();
    for (const set of session.sets) {
      const value = metricValueOf(set);
      if (value === null) {
        continue;
      }
      const key = `${set.exerciseId}:${set.trackingType}`;
      const current = bestByKey.get(key);
      if (current === undefined || value > current.value) {
        bestByKey.set(key, {
          exerciseId: set.exerciseId,
          trackingType: set.trackingType,
          value,
        });
      }
    }
    for (const { exerciseId, trackingType, value } of bestByKey.values()) {
      const bestsByTrackingType = bestsByExerciseId.get(exerciseId) ?? new Map<TrackingType, SessionBest[]>();
      bestsByTrackingType.set(trackingType, [
        ...(bestsByTrackingType.get(trackingType) ?? []),
        { startedAt: session.startedAt, bestValue: value },
      ]);
      bestsByExerciseId.set(exerciseId, bestsByTrackingType);
    }
  }
  return bestsByExerciseId;
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
  for (const [exerciseId, bestsByTrackingType] of bestsByExerciseId) {
    for (const sessionBests of bestsByTrackingType.values()) {
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
        });
      }
    }
  }
  return plateaus.sort((first, second) => second.weekCount - first.weekCount);
}

export function plateau(snapshot: CoachSnapshot): Insight[] {
  return findPlateaus(snapshot)
    .flatMap((foundPlateau) => {
      const exercise = snapshot.exercisesById.get(foundPlateau.exerciseId);
      return exercise === undefined ? [] : [{ exercise, weekCount: foundPlateau.weekCount }];
    })
    .slice(0, maximumListedPlateaus)
    .map(({ exercise, weekCount }): Insight => ({
      ruleIdentifier: 'plateau',
      topics: ['changeItUp', 'improvement'],
      priority: plateauPriority,
      nuggie: 'coach',
      messages: [
        `${exercise.name} has been stuck for ${weekCount} weeks. Try a new rep range (e.g. 5×5 → 4×8) or a variation.`,
      ],
      action: {
        label: `See ${exercise.name} history`,
        destination: { screen: 'exerciseHistory', exerciseId: exercise.id },
      },
    }));
}
