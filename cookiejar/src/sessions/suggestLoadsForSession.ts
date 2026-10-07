import { suggestNextLoad, type LoadSuggestion, type SuggestionSet } from '@/progress/suggestNextLoad';
import { topRepetitionsFor } from '@/progress/topRepetitionsFor';
import { takesSuggestedWeight } from '@/sessions/takesSuggestedWeight';
import type { FitnessGoal } from '@/types/Profile';
import type { SessionExerciseWithSets, SessionWithExercises } from '@/types/SessionWithExercises';

export type RecentSessionsByExerciseId = Map<number, SuggestionSet[][]>;

export type LoadSuggestionsBySessionExerciseId = Map<number, LoadSuggestion>;

export function suggestLoadForExercise(
  sessionExercise: SessionExerciseWithSets,
  recentSessionsByExerciseId: RecentSessionsByExerciseId,
  goal: FitnessGoal | null,
): LoadSuggestion | null {
  if (sessionExercise.trackingType !== 'repetitions_and_weight') {
    return null;
  }
  const recentSessions = recentSessionsByExerciseId.get(sessionExercise.exerciseId) ?? [];
  const topRepetitions = topRepetitionsFor(
    sessionExercise.sets.filter((set) => takesSuggestedWeight(set, sessionExercise.sets)).map((set) => set.targetRepetitions),
    goal,
  );
  return suggestNextLoad(recentSessions, topRepetitions);
}

export function suggestLoadsForSession(
  session: SessionWithExercises,
  recentSessionsByExerciseId: RecentSessionsByExerciseId,
  goal: FitnessGoal | null,
): LoadSuggestionsBySessionExerciseId {
  const suggestions: LoadSuggestionsBySessionExerciseId = new Map();
  for (const sessionExercise of session.exercises) {
    const suggestion = suggestLoadForExercise(sessionExercise, recentSessionsByExerciseId, goal);
    if (suggestion !== null) {
      suggestions.set(sessionExercise.id, suggestion);
    }
  }
  return suggestions;
}
