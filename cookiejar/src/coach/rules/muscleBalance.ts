import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import { chooseVariant } from '@/coach/chooseVariant';
import type { Insight } from '@/coach/Insight';
import { joinNames } from '@/coach/joinNames';
import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { bodyPartLabels, type BodyPart } from '@/types/BodyPart';

export const muscleBalancePriority = 45;
export const muscleBalanceWindowDayCount = 28;
export const noCoreWindowDayCount = 14;
export const lopsidedRatio = 1.5;

const pushBodyParts: readonly BodyPart[] = ['chest', 'shoulders', 'triceps'];
const pullBodyParts: readonly BodyPart[] = ['back', 'biceps'];
const anteriorLegBodyParts: readonly BodyPart[] = ['quadriceps'];
const posteriorChainBodyParts: readonly BodyPart[] = ['hamstrings', 'glutes'];

type Imbalance = {
  neglectedBodyPart: BodyPart;
  neglectedBodyParts: readonly BodyPart[];
  fallbackExercises: string;
  messages: (firstChoice: string, secondChoice: string) => readonly [string, string];
};

const maximumSuggestedExercises = 2;

function countSetsByBodyPart(snapshot: CoachSnapshot, windowStartTime: number): Map<BodyPart, number> {
  const setCounts = new Map<BodyPart, number>();
  for (const session of snapshot.sessionsLastTwelveWeeks) {
    if (new Date(session.startedAt).getTime() < windowStartTime) {
      continue;
    }
    for (const set of session.sets) {
      const exercise = snapshot.exercisesById.get(set.exerciseId);
      if (exercise !== undefined) {
        setCounts.set(exercise.bodyPart, (setCounts.get(exercise.bodyPart) ?? 0) + 1);
      }
    }
  }
  return setCounts;
}

function suggestedExerciseNames(snapshot: CoachSnapshot, bodyParts: readonly BodyPart[]): string[] {
  const setCountsByName = new Map<string, number>();
  for (const session of snapshot.sessionsLastTwelveWeeks) {
    for (const set of session.sets) {
      const exercise = snapshot.exercisesById.get(set.exerciseId);
      if (exercise !== undefined && bodyParts.includes(exercise.bodyPart)) {
        setCountsByName.set(exercise.name, (setCountsByName.get(exercise.name) ?? 0) + 1);
      }
    }
  }
  return [...setCountsByName]
    .sort(([firstName, firstCount], [secondName, secondCount]) => secondCount - firstCount || firstName.localeCompare(secondName))
    .slice(0, maximumSuggestedExercises)
    .map(([name]) => name);
}

function totalFor(setCounts: Map<BodyPart, number>, bodyParts: readonly BodyPart[]): number {
  return bodyParts.reduce((total, bodyPart) => total + (setCounts.get(bodyPart) ?? 0), 0);
}

function isLopsided(firstCount: number, secondCount: number): boolean {
  const larger = Math.max(firstCount, secondCount);
  const smaller = Math.min(firstCount, secondCount);
  return larger > 0 && larger > lopsidedRatio * smaller;
}

function pushPullImbalance(setCounts: Map<BodyPart, number>): Imbalance | null {
  const pushCount = totalFor(setCounts, pushBodyParts);
  const pullCount = totalFor(setCounts, pullBodyParts);
  if (!isLopsided(pushCount, pullCount)) {
    return null;
  }
  return pullCount < pushCount
    ? {
        neglectedBodyPart: 'back',
        neglectedBodyParts: pullBodyParts,
        fallbackExercises: 'rows and pull-ups',
        messages: (firstChoice, secondChoice) => [
          `${pushCount} push sets vs ${pullCount} pull sets in 4 weeks. Your back's feeling left out, not noopy! Add some ${firstChoice}.`,
          `Noop alert: ${pushCount} push sets, only ${pullCount} pull. Balance it out with ${secondChoice}.`,
        ],
      }
    : {
        neglectedBodyPart: 'chest',
        neglectedBodyParts: pushBodyParts,
        fallbackExercises: 'pressing',
        messages: (firstChoice, secondChoice) => [
          `${pullCount} pull sets vs ${pushCount} push sets in 4 weeks. Your chest's feeling left out, not noopy! Add some ${firstChoice}.`,
          `Noop alert: ${pullCount} pull sets, only ${pushCount} push. Balance it out with ${secondChoice}.`,
        ],
      };
}

function legImbalance(setCounts: Map<BodyPart, number>): Imbalance | null {
  const anteriorCount = totalFor(setCounts, anteriorLegBodyParts);
  const posteriorCount = totalFor(setCounts, posteriorChainBodyParts);
  if (!isLopsided(anteriorCount, posteriorCount)) {
    return null;
  }
  return posteriorCount < anteriorCount
    ? {
        neglectedBodyPart: 'hamstrings',
        neglectedBodyParts: posteriorChainBodyParts,
        fallbackExercises: 'hinges and curls',
        messages: (firstChoice, secondChoice) => [
          `${anteriorCount} quad sets vs ${posteriorCount} hamstring and glute sets in 4 weeks. Your hamstrings are feeling left out, not noopy! Add some ${firstChoice}.`,
          `Noop alert: ${anteriorCount} quad sets, only ${posteriorCount} hamstring and glute. Balance it out with ${secondChoice}.`,
        ],
      }
    : {
        neglectedBodyPart: 'quadriceps',
        neglectedBodyParts: anteriorLegBodyParts,
        fallbackExercises: 'squats or lunges',
        messages: (firstChoice, secondChoice) => [
          `${posteriorCount} hamstring and glute sets vs ${anteriorCount} quad sets in 4 weeks. Your quads are feeling left out, not noopy! Add some ${firstChoice}.`,
          `Noop alert: ${posteriorCount} hamstring and glute sets, only ${anteriorCount} quad. Balance it out with ${secondChoice}.`,
        ],
      };
}

function noCoreImbalance(snapshot: CoachSnapshot, todayStart: Date): Imbalance | null {
  const coreWindowStartTime = addDays(todayStart, -noCoreWindowDayCount).getTime();
  const hasTrainedRecently = snapshot.sessionsLastTwelveWeeks.some(
    (session) => new Date(session.startedAt).getTime() >= coreWindowStartTime,
  );
  if (!hasTrainedRecently) {
    return null;
  }
  const coreSetCount = countSetsByBodyPart(snapshot, coreWindowStartTime).get('core') ?? 0;
  return coreSetCount === 0
    ? {
        neglectedBodyPart: 'core',
        neglectedBodyParts: ['core'],
        fallbackExercises: 'planks or crunches',
        messages: (firstChoice, secondChoice) => [
          `Ohh my Noops! No core work in 2 weeks! A few sets of ${firstChoice} would sort it.`,
          `Your core's been on holiday for 2 weeks. Add some ${secondChoice}.`,
        ],
      }
    : null;
}

function imbalanceMessages(snapshot: CoachSnapshot, imbalance: Imbalance): readonly [string, string] {
  const names = suggestedExerciseNames(snapshot, imbalance.neglectedBodyParts);
  if (names.length === 0) {
    return imbalance.messages(imbalance.fallbackExercises, imbalance.fallbackExercises);
  }
  return imbalance.messages(joinNames(names, 'or'), joinNames(names, 'and'));
}

export function muscleBalance(snapshot: CoachSnapshot): Insight[] {
  const todayStart = parseLocalDateString(snapshot.today);
  const setCounts = countSetsByBodyPart(snapshot, addDays(todayStart, -muscleBalanceWindowDayCount).getTime());
  const imbalance = pushPullImbalance(setCounts) ?? legImbalance(setCounts) ?? noCoreImbalance(snapshot, todayStart);
  if (imbalance === null) {
    return [];
  }
  return [
    {
      ruleIdentifier: 'muscleBalance',
      topics: ['improvement'],
      priority: muscleBalancePriority,
      nuggie: 'analytics',
      messages: [chooseVariant(snapshot.now, imbalanceMessages(snapshot, imbalance))],
      action: {
        label: `Browse ${bodyPartLabels[imbalance.neglectedBodyPart]} exercises`,
        destination: {
          screen: 'exerciseLibrary',
          bodyPart: imbalance.neglectedBodyPart,
        },
      },
    },
  ];
}
