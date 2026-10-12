import { describe, expect, test } from 'bun:test';

import type { DefaultSwimWorkout } from '@/swimming/defaultSwimWorkouts';
import { buildExerciseIdLookup, resolveSwimSections, UnresolvedSwimStrokeError } from '@/swimming/resolveSwimSections';

const workout: DefaultSwimWorkout = {
  builtInKey: 'swim-test',
  name: 'Test',
  poolLengthMeters: 25,
  sections: [
    {
      name: 'Main',
      blocks: [
        {
          rounds: 1,
          restAfterSeconds: null,
          sets: [
            {
              strokeName: 'Freestyle',
              repetitions: 1,
              distanceMeters: 50,
              restMode: 'fixed',
              restSeconds: 20,
              sendOffSeconds: null,
              restAfterSeconds: null,
              equipment: [],
              notes: null,
            },
          ],
        },
      ],
    },
  ],
};

describe('resolveSwimSections', () => {
  test('matches stroke names case-insensitively and ignores surrounding spaces', () => {
    const lookup = buildExerciseIdLookup([{ id: 7, name: '  FREESTYLE ' }]);
    const sections = resolveSwimSections(workout, lookup);
    expect(sections[0].blocks[0].sets[0].exerciseId).toBe(7);
    expect(sections[0].blocks[0].sets[0].exerciseName).toBe('Freestyle');
  });

  test('throws UnresolvedSwimStrokeError when a stroke has no exercise', () => {
    const lookup = buildExerciseIdLookup([{ id: 1, name: 'Backstroke' }]);
    expect(() => resolveSwimSections(workout, lookup)).toThrow(UnresolvedSwimStrokeError);
  });

  test('keeps the first exercise when names collide ignoring case', () => {
    const lookup = buildExerciseIdLookup([
      { id: 3, name: 'Freestyle' },
      { id: 9, name: 'freestyle' },
    ]);
    expect(lookup.get('freestyle')).toBe(3);
  });
});
