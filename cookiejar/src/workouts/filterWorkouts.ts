export function filterWorkouts<Item extends { name: string }>(workouts: readonly Item[], searchText: string): Item[] {
  const normalizedSearchText = searchText.trim().toLocaleLowerCase();
  if (normalizedSearchText === '') {
    return [...workouts];
  }
  return workouts.filter((workout) => workout.name.toLocaleLowerCase().includes(normalizedSearchText));
}
