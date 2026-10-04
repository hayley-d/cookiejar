export const otherSectionTitle = '#';

export const alphabetIndexLetters = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', otherSectionTitle];

export type AlphabeticalSection<Item> = {
  title: string;
  data: Item[];
};

function foldAsciiCase(text: string) {
  return text.replace(/[A-Z]/g, (letter) => letter.toLowerCase());
}

function compareNoCase(first: string, second: string) {
  const foldedFirst = foldAsciiCase(first);
  const foldedSecond = foldAsciiCase(second);
  if (foldedFirst < foldedSecond) {
    return -1;
  }
  if (foldedFirst > foldedSecond) {
    return 1;
  }
  return 0;
}

function sectionTitleFor(name: string) {
  const firstCharacter = name.trim().normalize('NFD').charAt(0).toUpperCase();
  return /^[A-Z]$/.test(firstCharacter) ? firstCharacter : otherSectionTitle;
}

export function groupExercisesAlphabetically<Item extends { name: string }>(
  exercises: Item[],
): AlphabeticalSection<Item>[] {
  const exercisesByTitle = new Map<string, Item[]>();
  for (const exercise of exercises) {
    const title = sectionTitleFor(exercise.name);
    exercisesByTitle.set(title, [...(exercisesByTitle.get(title) ?? []), exercise]);
  }

  return alphabetIndexLetters
    .filter((letter) => exercisesByTitle.has(letter))
    .map((letter) => ({
      title: letter,
      data: [...(exercisesByTitle.get(letter) ?? [])].sort((first, second) => compareNoCase(first.name, second.name)),
    }));
}

export function findNearestSectionTitle(letter: string, sectionTitles: string[]): string | undefined {
  const letterPosition = alphabetIndexLetters.indexOf(letter);
  let nearestTitle: string | undefined;
  let nearestDistance = Infinity;

  for (const title of sectionTitles) {
    const distance = Math.abs(alphabetIndexLetters.indexOf(title) - letterPosition);
    const isLaterTie = distance === nearestDistance && alphabetIndexLetters.indexOf(title) > letterPosition;
    if (distance < nearestDistance || isLaterTie) {
      nearestTitle = title;
      nearestDistance = distance;
    }
  }

  return nearestTitle;
}
