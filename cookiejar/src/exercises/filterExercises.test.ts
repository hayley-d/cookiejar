import { describe, expect, test } from 'bun:test';

import { filterExercises } from '@/exercises/filterExercises';
import type { BodyPart } from '@/types/BodyPart';

const exercises: { id: number; name: string; bodyPart: BodyPart }[] = [
  { id: 1, name: 'Bench Press', bodyPart: 'chest' },
  { id: 2, name: 'Incline Bench Press', bodyPart: 'chest' },
  { id: 3, name: 'Squat', bodyPart: 'quadriceps' },
  { id: 4, name: 'Romanian Deadlift', bodyPart: 'hamstrings' },
  { id: 5, name: 'Hip Thrust', bodyPart: 'glutes' },
  { id: 6, name: 'Glute Bridge', bodyPart: 'glutes' },
];

function namesOf(filteredExercises: { name: string }[]) {
  return filteredExercises.map((exercise) => exercise.name);
}

describe('filterExercises by search text', () => {
  test('empty search text keeps every exercise', () => {
    expect(filterExercises(exercises, { searchText: '', bodyPart: null })).toEqual(exercises);
  });

  test('search text of only spaces keeps every exercise', () => {
    expect(filterExercises(exercises, { searchText: '   ', bodyPart: null })).toEqual(exercises);
  });

  test('matches a substring anywhere in the name', () => {
    expect(namesOf(filterExercises(exercises, { searchText: 'bench', bodyPart: null }))).toEqual([
      'Bench Press',
      'Incline Bench Press',
    ]);
    expect(namesOf(filterExercises(exercises, { searchText: 'lift', bodyPart: null }))).toEqual([
      'Romanian Deadlift',
    ]);
  });

  test('ignores case', () => {
    expect(namesOf(filterExercises(exercises, { searchText: 'SQU', bodyPart: null }))).toEqual(['Squat']);
  });

  test('ignores spaces around the search text', () => {
    expect(namesOf(filterExercises(exercises, { searchText: '  squat ', bodyPart: null }))).toEqual(['Squat']);
  });

  test('no match gives no exercises', () => {
    expect(filterExercises(exercises, { searchText: 'curl', bodyPart: null })).toEqual([]);
  });

  test('keeps the order it was given', () => {
    const reversed = [...exercises].reverse();
    expect(namesOf(filterExercises(reversed, { searchText: 'press', bodyPart: null }))).toEqual([
      'Incline Bench Press',
      'Bench Press',
    ]);
  });
});

describe('filterExercises by body part', () => {
  test('no body part keeps every exercise', () => {
    expect(filterExercises(exercises, { searchText: '', bodyPart: null })).toEqual(exercises);
  });

  test('keeps only exercises with that body part', () => {
    expect(namesOf(filterExercises(exercises, { searchText: '', bodyPart: 'glutes' }))).toEqual([
      'Hip Thrust',
      'Glute Bridge',
    ]);
  });

  test('a body part with no exercises gives no exercises', () => {
    expect(filterExercises(exercises, { searchText: '', bodyPart: 'calves' })).toEqual([]);
  });

  test('search text narrows within the body part', () => {
    expect(namesOf(filterExercises(exercises, { searchText: 'bridge', bodyPart: 'glutes' }))).toEqual([
      'Glute Bridge',
    ]);
  });

  test('search text that matches only other body parts gives no exercises', () => {
    expect(filterExercises(exercises, { searchText: 'bench', bodyPart: 'glutes' })).toEqual([]);
  });
});
