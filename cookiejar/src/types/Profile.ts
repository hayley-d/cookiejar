export type Sex = 'female' | 'male' | 'other';

export type FitnessGoal = 'strength' | 'hypertrophy' | 'endurance' | 'general_fitness' | 'weight_loss';

export type Profile = {
  id: number;
  displayName: string | null;
  birthDate: string | null;
  sex: Sex | null;
  heightCentimetres: number | null;
  goal: FitnessGoal | null;
  weeklyWorkoutTarget: number;
  dailyStepGoal: number;
  updatedAt: string;
};
