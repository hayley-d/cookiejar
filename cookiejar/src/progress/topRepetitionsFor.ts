import type { FitnessGoal } from '@/types/Profile';

const topRepetitionsByGoal: Record<FitnessGoal, number> = {
  strength: 6,
  hypertrophy: 12,
  general_fitness: 12,
  endurance: 20,
  weight_loss: 12,
};

const topRepetitionsWithoutGoal = 12;

export function topRepetitionsFor(targetRepetitions: (number | null)[], goal: FitnessGoal | null): number {
  const targets = targetRepetitions.filter((repetitions): repetitions is number => repetitions !== null);
  if (targets.length > 0) {
    return Math.max(...targets);
  }
  return goal === null ? topRepetitionsWithoutGoal : topRepetitionsByGoal[goal];
}
