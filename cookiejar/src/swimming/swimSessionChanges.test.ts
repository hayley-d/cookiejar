import { describe, expect, test } from 'bun:test';

import {
  findRepetitionCompletion,
  withAllRepetitionsCompleted,
  withRepetitionCompletion,
} from '@/swimming/swimSessionChanges';
import type { SwimSessionSection } from '@/swimming/swimSessionTypes';

const tickedAt = '2026-10-12T10:00:00.000Z';
const laterTickedAt = '2026-10-12T10:30:00.000Z';

function buildSections(): SwimSessionSection[] {
  return [
    {
      id: 1,
      name: 'Main',
      blocks: [
        {
          id: 1,
          rounds: 1,
          restAfterSeconds: null,
          sets: [
            {
              id: 1,
              exerciseId: 1,
              exerciseName: 'Freestyle',
              repetitions: 3,
              distanceMeters: 50,
              restMode: 'fixed',
              restSeconds: 30,
              sendOffSeconds: null,
              restAfterSeconds: null,
              equipment: [],
              notes: null,
              repetitionRows: [
                { id: 10, roundIndex: 0, repetitionIndex: 0, completedAt: tickedAt },
                { id: 11, roundIndex: 0, repetitionIndex: 1, completedAt: null },
                { id: 12, roundIndex: 0, repetitionIndex: 2, completedAt: null },
              ],
            },
          ],
        },
      ],
    },
  ];
}

function completions(sections: SwimSessionSection[]) {
  return sections[0].blocks[0].sets[0].repetitionRows.map((repetition) => repetition.completedAt);
}

describe('withRepetitionCompletion', () => {
  test('ticks one repetition', () => {
    expect(completions(withRepetitionCompletion(buildSections(), 11, laterTickedAt))).toEqual([
      tickedAt,
      laterTickedAt,
      null,
    ]);
  });

  test('unticks a repetition', () => {
    expect(completions(withRepetitionCompletion(buildSections(), 10, null))).toEqual([null, null, null]);
  });
});

describe('withAllRepetitionsCompleted', () => {
  test('ticks every open repetition and keeps earlier ticks', () => {
    expect(completions(withAllRepetitionsCompleted(buildSections(), laterTickedAt))).toEqual([
      tickedAt,
      laterTickedAt,
      laterTickedAt,
    ]);
  });
});

describe('findRepetitionCompletion', () => {
  test('finds a repetition completion', () => {
    expect(findRepetitionCompletion(buildSections(), 10)).toBe(tickedAt);
    expect(findRepetitionCompletion(buildSections(), 11)).toBeNull();
  });

  test('is undefined for an unknown repetition', () => {
    expect(findRepetitionCompletion(buildSections(), 99)).toBeUndefined();
  });
});
