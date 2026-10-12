import type { ChipOption } from '@/components/molecules/ChipGroup';
import type { WorkoutKind } from '@/types/WorkoutKind';

export type WorkoutKindFilter = 'all' | WorkoutKind;

const workoutKindFilterLabels: Record<WorkoutKind, string> = {
  individual: 'Strength',
  class: 'Class',
  activity: 'Activity',
  swim: 'Swim',
};

const workoutKindOrder: WorkoutKind[] = ['individual', 'class', 'activity', 'swim'];

export function workoutKindFilterOptions(workouts: readonly { kind: WorkoutKind }[]): ChipOption<WorkoutKindFilter>[] {
  const presentKinds = workoutKindOrder.filter((kind) => workouts.some((workout) => workout.kind === kind));
  if (presentKinds.length <= 1) {
    return [];
  }
  return [
    { value: 'all', label: 'All' },
    ...presentKinds.map((kind) => ({ value: kind, label: workoutKindFilterLabels[kind] })),
  ];
}

export function filterWorkoutsByKind<Item extends { kind: WorkoutKind }>(
  workouts: readonly Item[],
  kindFilter: WorkoutKindFilter,
): Item[] {
  if (kindFilter === 'all') {
    return [...workouts];
  }
  return workouts.filter((workout) => workout.kind === kindFilter);
}
