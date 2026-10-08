import type { DefaultExercise } from '@/exercises/parseExerciseLibraryCsv';

export function hashText(text: string) {
  let hash = 0x811c9dc5;
  for (let characterIndex = 0; characterIndex < text.length; characterIndex++) {
    hash ^= text.charCodeAt(characterIndex);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function renderDefaultExercisesModule(exercises: DefaultExercise[]) {
  const serializedExercises = JSON.stringify(exercises, null, 2);
  return [
    "import type { DefaultExercise } from '@/exercises/parseExerciseLibraryCsv';",
    '',
    `export const defaultExerciseLibraryVersion = '${hashText(serializedExercises)}';`,
    '',
    `export const defaultExercises: DefaultExercise[] = ${serializedExercises};`,
    '',
  ].join('\n');
}
