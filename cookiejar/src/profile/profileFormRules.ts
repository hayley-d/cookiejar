export const minimumHeightCentimetres = 50;
export const maximumHeightCentimetres = 272;
export const minimumWeeklyWorkoutTarget = 1;
export const maximumWeeklyWorkoutTarget = 14;
export const stepGoalIncrement = 500;
export const minimumStepGoal = 500;
export const maximumStepGoal = 50000;

export function snapStepGoal(stepGoal: number): number {
  const snappedStepGoal = Math.round(stepGoal / stepGoalIncrement) * stepGoalIncrement;
  return Math.min(maximumStepGoal, Math.max(minimumStepGoal, snappedStepGoal));
}
