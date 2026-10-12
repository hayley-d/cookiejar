import { describe, expect, test } from 'bun:test';

import { expandSwimRepetitions } from '@/swimming/expandSwimRepetitions';

describe('expandSwimRepetitions', () => {
  test('has no positions for no sections', () => {
    expect(expandSwimRepetitions([])).toEqual([]);
  });

  test('expands repetitions of a plain set', () => {
    expect(expandSwimRepetitions([{ blocks: [{ rounds: 1, sets: [{ repetitions: 2 }] }] }])).toEqual([
      { sectionIndex: 0, blockIndex: 0, setIndex: 0, roundIndex: 0, repetitionIndex: 0 },
      { sectionIndex: 0, blockIndex: 0, setIndex: 0, roundIndex: 0, repetitionIndex: 1 },
    ]);
  });

  test('lays a block out one round at a time', () => {
    const positions = expandSwimRepetitions([{ blocks: [{ rounds: 2, sets: [{ repetitions: 1 }, { repetitions: 2 }] }] }]);
    expect(positions.map((position) => [position.roundIndex, position.setIndex, position.repetitionIndex])).toEqual([
      [0, 0, 0],
      [0, 1, 0],
      [0, 1, 1],
      [1, 0, 0],
      [1, 1, 0],
      [1, 1, 1],
    ]);
  });

  test('orders positions by section then block', () => {
    const positions = expandSwimRepetitions([
      { blocks: [{ rounds: 1, sets: [{ repetitions: 1 }] }, { rounds: 1, sets: [{ repetitions: 1 }] }] },
      { blocks: [{ rounds: 1, sets: [{ repetitions: 1 }] }] },
    ]);
    expect(positions.map((position) => [position.sectionIndex, position.blockIndex])).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
    ]);
  });

  test('counts the phase example as rounds times repetitions times sets', () => {
    const positions = expandSwimRepetitions([
      { blocks: [{ rounds: 1, sets: [{ repetitions: 2 }] }] },
      { blocks: [{ rounds: 3, sets: [{ repetitions: 4 }, { repetitions: 4 }] }] },
      { blocks: [{ rounds: 1, sets: [{ repetitions: 1 }] }] },
    ]);
    expect(positions.length).toBe(2 + 24 + 1);
  });
});
