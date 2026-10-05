import type { FitnessGoal, Sex } from '@/types/Profile';

export const fitnessGoalLabels: Record<FitnessGoal, string> = {
  strength: 'Strength',
  hypertrophy: 'Muscle',
  endurance: 'Endurance',
  general_fitness: 'General fitness',
  weight_loss: 'Weight loss',
};

export const fitnessGoals: FitnessGoal[] = ['strength', 'hypertrophy', 'endurance', 'general_fitness', 'weight_loss'];

export const sexLabels: Record<Sex, string> = {
  female: 'Female',
  male: 'Male',
  other: 'Other',
};

export const sexes: Sex[] = ['female', 'male', 'other'];
