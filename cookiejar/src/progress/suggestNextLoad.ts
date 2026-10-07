import { incrementForLoad } from '@/progress/loadIncrement';

export type SuggestionSet = {
  weightKilograms: number | null;
  repetitions: number | null;
};

export type LoadSuggestion = {
  weightKilograms: number;
  increasedByKilograms: number | null;
};

export const sessionsConsidered = 3;

function weightedSets(sets: SuggestionSet[]): SuggestionSet[] {
  return sets.filter((set) => set.weightKilograms !== null && set.weightKilograms > 0);
}

function heaviestWeight(sets: SuggestionSet[]): number {
  return Math.max(...sets.map((set) => set.weightKilograms ?? 0));
}

export function suggestNextLoad(
  recentSessionsNewestFirst: SuggestionSet[][],
  topRepetitions: number,
): LoadSuggestion | null {
  const sessions = recentSessionsNewestFirst
    .map(weightedSets)
    .filter((sets) => sets.length > 0)
    .slice(0, sessionsConsidered);
  const latestSession = sessions[0];
  if (latestSession === undefined) {
    return null;
  }
  const workingWeight = heaviestWeight(latestSession);
  const hold: LoadSuggestion = { weightKilograms: workingWeight, increasedByKilograms: null };
  if (sessions.length < sessionsConsidered) {
    return hold;
  }
  if (sessions.some((sets) => heaviestWeight(sets) < workingWeight)) {
    return hold;
  }
  const setsAtWorkingWeight = sessions
    .flat()
    .filter((set) => (set.weightKilograms ?? 0) >= workingWeight);
  const totalRepetitions = setsAtWorkingWeight.reduce((total, set) => total + (set.repetitions ?? 0), 0);
  if (totalRepetitions / setsAtWorkingWeight.length < topRepetitions) {
    return hold;
  }
  const increment = incrementForLoad(workingWeight);
  return { weightKilograms: workingWeight + increment, increasedByKilograms: increment };
}
