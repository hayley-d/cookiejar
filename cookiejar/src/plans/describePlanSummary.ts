export function describePlanSummary(entryCount: number): string {
  if (entryCount === 0) {
    return 'No workouts yet';
  }
  return `${entryCount} ${entryCount === 1 ? 'workout' : 'workouts'} / week`;
}
