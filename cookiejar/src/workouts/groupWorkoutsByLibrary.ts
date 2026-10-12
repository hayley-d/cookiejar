import { parseSwimBuiltInKey, type SwimLevel } from '@/swimming/defaultSwimWorkouts';
import { filterWorkouts } from '@/workouts/filterWorkouts';

export type LibraryWorkoutGroup<Item> = {
  title: string;
  data: Item[];
};

type GroupableWorkout = { name: string; builtInKey: string | null };

const levelOrder: SwimLevel[] = ['beginner', 'intermediate', 'advanced'];

const levelTitles: Record<SwimLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const myWorkoutsTitle = 'My workouts';
const unrecognizedBuiltInTitle = 'Other built-in workouts';

export function groupWorkoutsByLibrary<Item extends GroupableWorkout>(
  workouts: readonly Item[],
  searchText: string,
): LibraryWorkoutGroup<Item>[] {
  const matchingWorkouts = filterWorkouts(workouts, searchText);
  const myWorkouts: Item[] = [];
  const unrecognizedBuiltIns: Item[] = [];
  const levelEntries = new Map<SwimLevel, { workout: Item; week: number; session: string }[]>();

  for (const workout of matchingWorkouts) {
    if (workout.builtInKey === null) {
      myWorkouts.push(workout);
      continue;
    }
    const parsedKey = parseSwimBuiltInKey(workout.builtInKey);
    if (parsedKey === null) {
      unrecognizedBuiltIns.push(workout);
      continue;
    }
    const entries = levelEntries.get(parsedKey.level) ?? [];
    entries.push({
      workout,
      week: parsedKey.week ?? Number.POSITIVE_INFINITY,
      session: parsedKey.session ?? '',
    });
    levelEntries.set(parsedKey.level, entries);
  }

  const groups: LibraryWorkoutGroup<Item>[] = [{ title: myWorkoutsTitle, data: myWorkouts }];
  for (const level of levelOrder) {
    const entries = [...(levelEntries.get(level) ?? [])].sort((first, second) => {
      if (first.week !== second.week) {
        return first.week < second.week ? -1 : 1;
      }
      return first.session.localeCompare(second.session);
    });
    groups.push({ title: levelTitles[level], data: entries.map((entry) => entry.workout) });
  }
  groups.push({ title: unrecognizedBuiltInTitle, data: unrecognizedBuiltIns });

  return groups.filter((group) => group.data.length > 0);
}
