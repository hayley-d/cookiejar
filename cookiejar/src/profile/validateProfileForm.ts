import {
  maximumHeightCentimetres,
  maximumStepGoal,
  maximumWeeklyWorkoutTarget,
  minimumHeightCentimetres,
  minimumStepGoal,
  minimumWeeklyWorkoutTarget,
  stepGoalIncrement,
} from '@/profile/profileFormRules';
import type { FitnessGoal, Sex } from '@/types/Profile';

export type ProfileFormValues = {
  displayName: string;
  birthDate: string | null;
  sex: Sex | null;
  heightCentimetres: number | null;
  goal: FitnessGoal | null;
  weeklyWorkoutTarget: number;
  dailyStepGoal: number;
};

export type ProfileFormErrors = Partial<
  Record<'birthDate' | 'heightCentimetres' | 'weeklyWorkoutTarget' | 'dailyStepGoal', string>
>;

export type ProfileUpdate = {
  displayName: string | null;
  birthDate: string | null;
  sex: Sex | null;
  heightCentimetres: number | null;
  goal: FitnessGoal | null;
  weeklyWorkoutTarget: number;
  dailyStepGoal: number;
};

export function validateProfileForm(values: ProfileFormValues, today: string): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  if (values.birthDate !== null && values.birthDate > today) {
    errors.birthDate = 'Birth date cannot be in the future';
  }

  if (
    values.heightCentimetres !== null &&
    (!Number.isFinite(values.heightCentimetres) ||
      values.heightCentimetres < minimumHeightCentimetres ||
      values.heightCentimetres > maximumHeightCentimetres)
  ) {
    errors.heightCentimetres = `Height must be between ${minimumHeightCentimetres} and ${maximumHeightCentimetres} cm`;
  }

  if (
    !Number.isInteger(values.weeklyWorkoutTarget) ||
    values.weeklyWorkoutTarget < minimumWeeklyWorkoutTarget ||
    values.weeklyWorkoutTarget > maximumWeeklyWorkoutTarget
  ) {
    errors.weeklyWorkoutTarget = `Weekly target must be between ${minimumWeeklyWorkoutTarget} and ${maximumWeeklyWorkoutTarget}`;
  }

  if (
    !Number.isInteger(values.dailyStepGoal) ||
    values.dailyStepGoal < minimumStepGoal ||
    values.dailyStepGoal > maximumStepGoal ||
    values.dailyStepGoal % stepGoalIncrement !== 0
  ) {
    errors.dailyStepGoal = `Step goal must be a multiple of ${stepGoalIncrement} between ${minimumStepGoal} and ${maximumStepGoal}`;
  }

  return errors;
}

export function toProfileUpdate(values: ProfileFormValues): ProfileUpdate {
  const trimmedName = values.displayName.trim();
  return {
    displayName: trimmedName.length === 0 ? null : trimmedName,
    birthDate: values.birthDate,
    sex: values.sex,
    heightCentimetres: values.heightCentimetres,
    goal: values.goal,
    weeklyWorkoutTarget: values.weeklyWorkoutTarget,
    dailyStepGoal: values.dailyStepGoal,
  };
}
