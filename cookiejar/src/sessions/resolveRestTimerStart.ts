export const defaultRestSeconds = 90;

type RestSet = {
  id: number;
  completedAt: string | null;
};

type RestExercise = {
  supersetGroup: string | null;
  restSeconds: number | null;
  sets: readonly RestSet[];
};

export type RestTimerStart = { shouldStart: false } | { shouldStart: true; restSeconds: number };

const doesNotStart: RestTimerStart = { shouldStart: false };

export function resolveRestTimerStart(exercises: readonly RestExercise[], tickedSessionSetId: number): RestTimerStart {
  const tickedExercise = exercises.find((exercise) => exercise.sets.some((set) => set.id === tickedSessionSetId));
  if (tickedExercise === undefined) {
    return doesNotStart;
  }
  const tickedSetIndex = tickedExercise.sets.findIndex((set) => set.id === tickedSessionSetId);
  const tickedSet = tickedExercise.sets[tickedSetIndex];
  if (tickedSet === undefined || tickedSet.completedAt === null) {
    return doesNotStart;
  }

  if (tickedExercise.supersetGroup === null) {
    return { shouldStart: true, restSeconds: tickedExercise.restSeconds ?? defaultRestSeconds };
  }

  const groupMembers = exercises.filter((exercise) => exercise.supersetGroup === tickedExercise.supersetGroup);
  const lastMember = groupMembers[groupMembers.length - 1];
  if (lastMember !== tickedExercise) {
    return doesNotStart;
  }

  const isRoundComplete = groupMembers.every((member) => {
    const memberSet = member.sets[tickedSetIndex];
    return memberSet === undefined || memberSet.completedAt !== null;
  });
  if (!isRoundComplete) {
    return doesNotStart;
  }
  return { shouldStart: true, restSeconds: lastMember.restSeconds ?? defaultRestSeconds };
}
