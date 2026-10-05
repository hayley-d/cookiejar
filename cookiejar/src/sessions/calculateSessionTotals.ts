type TotalsSet = {
  repetitions: number | null;
  weightKilograms: number | null;
  completedAt: string | null;
};

type TotalsSession = {
  startedAt: string;
  finishedAt: string | null;
  exercises: readonly { sets: readonly TotalsSet[] }[];
};

export type SessionTotals = {
  durationSeconds: number;
  volumeKilograms: number;
  completedSetCount: number;
};

const millisecondsPerSecond = 1000;

export function elapsedSecondsBetween(startedAt: string, endedAt: Date): number {
  const elapsedMilliseconds = endedAt.getTime() - new Date(startedAt).getTime();
  if (!Number.isFinite(elapsedMilliseconds)) {
    return 0;
  }
  return Math.max(0, Math.floor(elapsedMilliseconds / millisecondsPerSecond));
}

export function calculateSessionTotals(session: TotalsSession, now: Date): SessionTotals {
  const endedAt = session.finishedAt === null ? now : new Date(session.finishedAt);
  let volumeKilograms = 0;
  let completedSetCount = 0;
  for (const exercise of session.exercises) {
    for (const set of exercise.sets) {
      if (set.completedAt === null) {
        continue;
      }
      completedSetCount += 1;
      if (set.weightKilograms !== null && set.repetitions !== null) {
        volumeKilograms += set.weightKilograms * set.repetitions;
      }
    }
  }
  return {
    durationSeconds: elapsedSecondsBetween(session.startedAt, endedAt),
    volumeKilograms,
    completedSetCount,
  };
}
