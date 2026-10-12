import { describe, expect, test } from 'bun:test';

import { swimBuiltInKey } from '@/swimming/defaultSwimWorkouts';
import { groupWorkoutsByLibrary } from '@/workouts/groupWorkoutsByLibrary';

function builtIn(level: 'beginner' | 'intermediate' | 'advanced', week: number | null, session: 'a' | 'b' | null) {
  const builtInKey = swimBuiltInKey(level, week, session);
  return { name: `${level} week ${week} ${session}`, builtInKey };
}

function userWorkout(name: string) {
  return { name, builtInKey: null };
}

describe('groupWorkoutsByLibrary', () => {
  test('my workouts come first and keep their incoming order', () => {
    const groups = groupWorkoutsByLibrary(
      [builtIn('beginner', 1, 'a'), userWorkout('Second'), userWorkout('First')],
      '',
    );
    expect(groups.map((group) => group.title)).toEqual(['My workouts', 'Beginner']);
    expect(groups[0].data.map((workout) => workout.name)).toEqual(['Second', 'First']);
  });

  test('levels are ordered beginner, intermediate, advanced', () => {
    const groups = groupWorkoutsByLibrary(
      [builtIn('advanced', 1, 'a'), builtIn('beginner', 1, 'a'), builtIn('intermediate', 1, 'a')],
      '',
    );
    expect(groups.map((group) => group.title)).toEqual(['Beginner', 'Intermediate', 'Advanced']);
  });

  test('within a level weeks ascend, A precedes B and recovery is last', () => {
    const groups = groupWorkoutsByLibrary(
      [
        builtIn('beginner', null, null),
        builtIn('beginner', 10, 'a'),
        builtIn('beginner', 2, 'b'),
        builtIn('beginner', 2, 'a'),
        builtIn('beginner', 1, 'b'),
        builtIn('beginner', 1, 'a'),
      ],
      '',
    );
    expect(groups).toHaveLength(1);
    expect(groups[0].data.map((workout) => workout.builtInKey)).toEqual([
      'swim-beginner-week-1-a',
      'swim-beginner-week-1-b',
      'swim-beginner-week-2-a',
      'swim-beginner-week-2-b',
      'swim-beginner-week-10-a',
      'swim-beginner-recovery',
    ]);
  });

  test('empty groups are hidden', () => {
    expect(groupWorkoutsByLibrary([], '')).toEqual([]);
    const groups = groupWorkoutsByLibrary([builtIn('advanced', 3, 'a')], '');
    expect(groups.map((group) => group.title)).toEqual(['Advanced']);
  });

  test('search narrows results within the groups and hides groups left empty', () => {
    const groups = groupWorkoutsByLibrary(
      [
        userWorkout('Push Day'),
        { name: 'Beginner · Week 3 · Base', builtInKey: 'swim-beginner-week-3-a' },
        { name: 'Beginner · Week 4 · Base', builtInKey: 'swim-beginner-week-4-a' },
        { name: 'Advanced · Week 3 · Speed', builtInKey: 'swim-advanced-week-3-b' },
      ],
      'week 3',
    );
    expect(groups.map((group) => group.title)).toEqual(['Beginner', 'Advanced']);
    expect(groups[0].data.map((workout) => workout.name)).toEqual(['Beginner · Week 3 · Base']);
  });

  test('a key that does not parse goes into a final group instead of crashing', () => {
    const groups = groupWorkoutsByLibrary(
      [{ name: 'Mystery', builtInKey: 'swim-expert-week-1-a' }, builtIn('advanced', 1, 'a'), userWorkout('Mine')],
      '',
    );
    expect(groups.map((group) => group.title)).toEqual(['My workouts', 'Advanced', 'Other built-in workouts']);
    expect(groups[2].data[0].name).toBe('Mystery');
  });
});
