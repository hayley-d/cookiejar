import { describe, expect, test } from 'bun:test';

import { filterExercisesByName } from '@/progress/filterExercisesByName';

const exercises = [{ name: 'Bench Press' }, { name: 'Squat' }, { name: 'Incline bench' }];

describe('filterExercisesByName', () => {
  test('returns everything for blank text', () => {
    expect(filterExercisesByName(exercises, '')).toEqual(exercises);
    expect(filterExercisesByName(exercises, '   ')).toEqual(exercises);
  });

  test('matches part of a name ignoring case', () => {
    expect(filterExercisesByName(exercises, 'BENCH')).toEqual([{ name: 'Bench Press' }, { name: 'Incline bench' }]);
    expect(filterExercisesByName(exercises, ' squ ')).toEqual([{ name: 'Squat' }]);
  });

  test('returns nothing when nothing matches', () => {
    expect(filterExercisesByName(exercises, 'deadlift')).toEqual([]);
  });
});
