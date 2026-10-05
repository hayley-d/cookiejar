import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import type { Insight } from '@/coach/Insight';
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

type Imbalance = { neglectedBodyPart: BodyPart; message: string };

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
        message: `${pushCount} push sets against ${pullCount} pull sets in the last 4 weeks. Add some rows and pull-ups.`,
      }
    : {
        neglectedBodyPart: 'chest',
        message: `${pullCount} pull sets against ${pushCount} push sets in the last 4 weeks. Add some pressing.`,
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
        message: `${anteriorCount} quad sets against ${posteriorCount} hamstring and glute sets in the last 4 weeks. Add some hinges and curls.`,
      }
    : {
        neglectedBodyPart: 'quadriceps',
        message: `${posteriorCount} hamstring and glute sets against ${anteriorCount} quad sets in the last 4 weeks. Add some squats or lunges.`,
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
        message: 'No core work in the last 2 weeks. Add a few sets of planks or crunches.',
      }
    : null;
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
      messages: [imbalance.message],
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
