import { describe, expect, test } from 'bun:test';

import {
  alphabetIndexLetters,
  findNearestSectionTitle,
  groupExercisesAlphabetically,
} from '@/exercises/groupExercisesAlphabetically';

function exercisesNamed(...names: string[]) {
  return names.map((name, position) => ({ id: position + 1, name }));
}

function sectionSummary(sections: { title: string; data: { name: string }[] }[]) {
  return sections.map((section) => [section.title, section.data.map((exercise) => exercise.name)]);
}

describe('groupExercisesAlphabetically', () => {
  test('no exercises gives no sections', () => {
    expect(groupExercisesAlphabetically([])).toEqual([]);
  });

  test('groups exercises by their first letter, ignoring case', () => {
    const sections = groupExercisesAlphabetically(exercisesNamed('Squat', 'bench press', 'Bicep Curl', 'Shrug'));
    expect(sectionSummary(sections)).toEqual([
      ['B', ['bench press', 'Bicep Curl']],
      ['S', ['Shrug', 'Squat']],
    ]);
  });

  test('names that start with a digit or a symbol go under #', () => {
    const sections = groupExercisesAlphabetically(exercisesNamed('1RM Press', '(Banded) Row', 'Deadlift'));
    expect(sectionSummary(sections)).toEqual([
      ['D', ['Deadlift']],
      ['#', ['(Banded) Row', '1RM Press']],
    ]);
  });

  test('the # section comes last', () => {
    const sections = groupExercisesAlphabetically(exercisesNamed('90/90 Stretch', 'Zercher Squat', 'Arnold Press'));
    expect(sections.map((section) => section.title)).toEqual(['A', 'Z', '#']);
  });

  test('sorts within a section the way NOCASE does', () => {
    const sections = groupExercisesAlphabetically(exercisesNamed('Lunge', 'leg press', 'LAT PULLDOWN', 'Leg Curl'));
    expect(sectionSummary(sections)).toEqual([['L', ['LAT PULLDOWN', 'Leg Curl', 'leg press', 'Lunge']]]);
  });

  test('a letter with an accent goes under its base letter', () => {
    const sections = groupExercisesAlphabetically(exercisesNamed('Élévation', 'Extension'));
    expect(sections.map((section) => section.title)).toEqual(['E']);
  });

  test('leading spaces are ignored when choosing the section', () => {
    const sections = groupExercisesAlphabetically(exercisesNamed('  Plank'));
    expect(sections.map((section) => section.title)).toEqual(['P']);
  });

  test('keeps the whole exercise in the section data', () => {
    const exercises = [{ id: 7, name: 'Row', bodyPart: 'back' }];
    expect(groupExercisesAlphabetically(exercises)[0].data[0]).toBe(exercises[0]);
  });
});

describe('alphabetIndexLetters', () => {
  test('lists A to Z followed by #', () => {
    expect(alphabetIndexLetters.join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ#');
  });
});

describe('findNearestSectionTitle', () => {
  test('a letter with a section resolves to itself', () => {
    expect(findNearestSectionTitle('C', ['A', 'C', 'F'])).toBe('C');
  });

  test('an empty letter resolves to the closest section', () => {
    expect(findNearestSectionTitle('E', ['A', 'C', 'F'])).toBe('F');
    expect(findNearestSectionTitle('B', ['A', 'E'])).toBe('A');
  });

  test('a tie resolves to the later section', () => {
    expect(findNearestSectionTitle('B', ['A', 'C'])).toBe('C');
  });

  test('an empty letter past the last section resolves to the last section', () => {
    expect(findNearestSectionTitle('Z', ['A', 'M'])).toBe('M');
  });

  test('# resolves to the closest letter when there is no # section', () => {
    expect(findNearestSectionTitle('#', ['B', 'X'])).toBe('X');
  });

  test('a letter resolves to # when # is the only section', () => {
    expect(findNearestSectionTitle('A', ['#'])).toBe('#');
  });

  test('no sections gives no title', () => {
    expect(findNearestSectionTitle('A', [])).toBeUndefined();
  });
});
