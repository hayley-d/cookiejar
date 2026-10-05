export const editWorkoutRouteName = '[workoutId]/edit';

export type BuilderLeaveSituation = {
  hasUnsavedChanges: boolean;
  isLeavingPermitted: boolean;
  isReordering: boolean;
  routeIndex: number;
  routeName: string;
};

export function shouldGuardLeavingBuilder({
  hasUnsavedChanges,
  isLeavingPermitted,
  isReordering,
  routeIndex,
  routeName,
}: BuilderLeaveSituation) {
  if (!hasUnsavedChanges || isLeavingPermitted || isReordering) {
    return false;
  }
  return routeIndex === 0 || routeName === editWorkoutRouteName;
}
