import { describe, expect, test } from 'bun:test';

import type { WorkoutKind } from '@/types/WorkoutKind';
import { filterWorkoutsByKind, workoutKindFilterOptions } from '@/workouts/workoutKindFilter';

function workoutOfKind(name: string, kind: WorkoutKind) {
  return { name, kind };
}

describe('workoutKindFilterOptions', () => {
  test('no workouts gives no chips', () => {
    expect(workoutKindFilterOptions([])).toEqual([]);
  });

  test('a single kind gives no chips', () => {
    expect(workoutKindFilterOptions([workoutOfKind('Push Day', 'individual'), workoutOfKind('Leg Day', 'individual')])).toEqual([]);
  });

  test('only kinds that exist get a chip, in a fixed order after All', () => {
    const workouts = [
      workoutOfKind('Easy 2k', 'swim'),
      workoutOfKind('Push Day', 'individual'),
      workoutOfKind('Morning Spin', 'class'),
    ];
    expect(workoutKindFilterOptions(workouts).map((option) => option.label)).toEqual(['All', 'Strength', 'Class', 'Swim']);
  });
});

describe('filterWorkoutsByKind', () => {
  const workouts = [
    workoutOfKind('Push Day', 'individual'),
    workoutOfKind('Morning Spin', 'class'),
    workoutOfKind('Leg Day', 'individual'),
  ];

  test('all keeps every workout', () => {
    expect(filterWorkoutsByKind(workouts, 'all')).toEqual(workouts);
  });

  test('a kind keeps only workouts of that kind', () => {
    expect(filterWorkoutsByKind(workouts, 'individual').map((workout) => workout.name)).toEqual(['Push Day', 'Leg Day']);
  });

  test('a kind with no workouts gives an empty list', () => {
    expect(filterWorkoutsByKind(workouts, 'swim')).toEqual([]);
  });
});
