export function toggleExerciseSelection(selectedExerciseIds: number[], exerciseId: number) {
  if (selectedExerciseIds.includes(exerciseId)) {
    return selectedExerciseIds.filter((selectedExerciseId) => selectedExerciseId !== exerciseId);
  }
  return [...selectedExerciseIds, exerciseId];
}
