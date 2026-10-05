export function filterExercisesByName<Exercise extends { name: string }>(
  exercises: readonly Exercise[],
  searchText: string,
): Exercise[] {
  const query = searchText.trim().toLowerCase();
  if (query === '') {
    return [...exercises];
  }
  return exercises.filter((exercise) => exercise.name.toLowerCase().includes(query));
}
