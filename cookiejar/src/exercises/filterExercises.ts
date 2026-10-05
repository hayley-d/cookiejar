import type { BodyPart } from '@/types/BodyPart';

export type ExerciseFilter = {
  searchText: string;
  bodyPart: BodyPart | null;
};

export function filterExercises<Item extends { name: string; bodyPart: BodyPart }>(
  exercises: Item[],
  { searchText, bodyPart }: ExerciseFilter,
) {
  const normalizedSearchText = searchText.trim().toLocaleLowerCase();
  if (normalizedSearchText === '' && bodyPart === null) {
    return exercises;
  }
  return exercises.filter(
    (exercise) =>
      (bodyPart === null || exercise.bodyPart === bodyPart) &&
      exercise.name.toLocaleLowerCase().includes(normalizedSearchText),
  );
}
