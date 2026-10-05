import { describe, expect, test } from 'bun:test';

import { filterExercises } from '@/exercises/filterExercises';

const exercises = [
  { id: 1, name: 'Bench Press' },
  { id: 2, name: 'Incline Bench Press' },
  { id: 3, name: 'Squat' },
  { id: 4, name: 'Romanian Deadlift' },
];

function namesOf(filteredExercises: { name: string }[]) {
  return filteredExercises.map((exercise) => exercise.name);
}

describe('filterExercises', () => {
  test('empty search text keeps every exercise', () => {
    expect(filterExercises(exercises, { searchText: '' })).toEqual(exercises);
  });

  test('search text of only spaces keeps every exercise', () => {
    expect(filterExercises(exercises, { searchText: '   ' })).toEqual(exercises);
  });

  test('matches a substring anywhere in the name', () => {
    expect(namesOf(filterExercises(exercises, { searchText: 'bench' }))).toEqual([
      'Bench Press',
      'Incline Bench Press',
    ]);
    expect(namesOf(filterExercises(exercises, { searchText: 'lift' }))).toEqual(['Romanian Deadlift']);
  });

  test('ignores case', () => {
    expect(namesOf(filterExercises(exercises, { searchText: 'SQU' }))).toEqual(['Squat']);
  });

  test('ignores spaces around the search text', () => {
    expect(namesOf(filterExercises(exercises, { searchText: '  squat ' }))).toEqual(['Squat']);
  });

  test('no match gives no exercises', () => {
    expect(filterExercises(exercises, { searchText: 'curl' })).toEqual([]);
  });

  test('keeps the order it was given', () => {
    const reversed = [...exercises].reverse();
    expect(namesOf(filterExercises(reversed, { searchText: 'press' }))).toEqual([
      'Incline Bench Press',
      'Bench Press',
    ]);
  });
});
