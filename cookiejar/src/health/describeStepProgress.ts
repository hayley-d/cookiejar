export type StepProgress = {
  percentage: number;
  caption: string;
  ringProgress: number;
  isGoalReached: boolean;
};

export function formatCompactStepGoal(goal: number): string {
  if (goal < 1000) {
    return String(Math.round(goal));
  }
  const thousands = Math.round((goal / 1000) * 10) / 10;
  return `${thousands}k`;
}

export function describeStepProgress(
  steps: number,
  goal: number,
): StepProgress {
  const hasGoal = goal > 0;
  const ratio = hasGoal ? Math.max(0, steps) / goal : 0;
  const percentage = hasGoal
    ? Math.floor((Math.max(0, steps) * 100) / goal)
    : 0;
  return {
    percentage,
    caption: `${percentage}% of ${formatCompactStepGoal(goal)}`,
    ringProgress: Math.min(1, ratio),
    isGoalReached: hasGoal && steps >= goal,
  };
}
