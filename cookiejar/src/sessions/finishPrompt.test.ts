import { describe, expect, test } from 'bun:test';

import { describeUntickedSets, resolveFinishPrompt } from '@/sessions/finishPrompt';

const ticked = { completedAt: '2026-10-05T08:10:00Z' };
const unticked = { completedAt: null };

describe('resolveFinishPrompt', () => {
  test('every set ticked finishes straight away', () => {
    expect(resolveFinishPrompt([{ sets: [ticked, ticked] }])).toEqual({ kind: 'finish' });
  });

  test('some unticked sets ask first with the unticked count across exercises', () => {
    expect(resolveFinishPrompt([{ sets: [ticked, unticked] }, { sets: [unticked, unticked] }])).toEqual({
      kind: 'confirmUnticked',
      untickedSetCount: 3,
    });
  });

  test('nothing ticked offers discard instead', () => {
    expect(resolveFinishPrompt([{ sets: [unticked] }, { sets: [unticked] }])).toEqual({ kind: 'offerDiscard' });
  });

  test('a session with no sets at all finishes straight away', () => {
    expect(resolveFinishPrompt([])).toEqual({ kind: 'finish' });
    expect(resolveFinishPrompt([{ sets: [] }])).toEqual({ kind: 'finish' });
  });
});

describe('describeUntickedSets', () => {
  test('counts sets in the question', () => {
    expect(describeUntickedSets(3)).toBe('3 sets not completed — finish anyway?');
    expect(describeUntickedSets(1)).toBe('1 set not completed — finish anyway?');
  });
});
