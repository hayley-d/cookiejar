export type ExerciseFilter = {
  searchText: string;
};

export function filterExercises<Item extends { name: string }>(exercises: Item[], { searchText }: ExerciseFilter) {
  const normalizedSearchText = searchText.trim().toLocaleLowerCase();
  if (normalizedSearchText === '') {
    return exercises;
  }
  return exercises.filter((exercise) => exercise.name.toLocaleLowerCase().includes(normalizedSearchText));
}
