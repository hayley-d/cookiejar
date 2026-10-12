import { describe, expect, test } from 'bun:test';

import { defaultExercises } from '@/exercises/defaultExercises';
import {
  defaultSwimWorkoutLibraryVersion,
  defaultSwimWorkouts,
  swimBuiltInKey,
  type DefaultSwimSet,
  type DefaultSwimWorkout,
} from '@/swimming/defaultSwimWorkouts';
import { swimWorkoutDistance } from '@/swimming/swimDistance';

const expectedTotalsByKey: Record<string, number> = {
  'swim-beginner-week-1-a': 700,
  'swim-beginner-week-1-b': 800,
  'swim-beginner-week-2-a': 800,
  'swim-beginner-week-2-b': 900,
  'swim-beginner-week-3-a': 900,
  'swim-beginner-week-3-b': 1000,
  'swim-beginner-week-4-a': 600,
  'swim-beginner-week-4-b': 700,
  'swim-beginner-week-5-a': 1000,
  'swim-beginner-week-5-b': 1100,
  'swim-beginner-week-6-a': 1000,
  'swim-beginner-week-6-b': 1200,
  'swim-beginner-recovery': 500,
  'swim-intermediate-week-1-a': 1800,
  'swim-intermediate-week-1-b': 1800,
  'swim-intermediate-week-2-a': 2000,
  'swim-intermediate-week-2-b': 2000,
  'swim-intermediate-week-3-a': 2200,
  'swim-intermediate-week-3-b': 1900,
  'swim-intermediate-week-4-a': 1500,
  'swim-intermediate-week-4-b': 1600,
  'swim-intermediate-week-5-a': 2400,
  'swim-intermediate-week-5-b': 2300,
  'swim-intermediate-week-6-a': 2000,
  'swim-intermediate-week-6-b': 1800,
  'swim-intermediate-recovery': 1100,
  'swim-advanced-week-1-a': 3000,
  'swim-advanced-week-1-b': 2400,
  'swim-advanced-week-2-a': 3200,
  'swim-advanced-week-2-b': 3000,
  'swim-advanced-week-3-a': 3400,
  'swim-advanced-week-3-b': 2800,
  'swim-advanced-week-4-a': 2500,
  'swim-advanced-week-4-b': 2400,
  'swim-advanced-week-5-a': 3600,
  'swim-advanced-week-5-b': 3200,
  'swim-advanced-week-6-a': 3000,
  'swim-advanced-week-6-b': 2600,
  'swim-advanced-recovery': 1800,
};

function allSets(workout: DefaultSwimWorkout): DefaultSwimSet[] {
  return workout.sections.flatMap((section) => section.blocks.flatMap((block) => block.sets));
}

function mainSets(workout: DefaultSwimWorkout): DefaultSwimSet[] {
  return workout.sections
    .filter((section) => section.name === 'Main')
    .flatMap((section) => section.blocks.flatMap((block) => block.sets));
}

describe('defaultSwimWorkouts', () => {
  test('has 39 workouts with unique keys that match the expected key list', () => {
    const keys = defaultSwimWorkouts.map((workout) => workout.builtInKey);
    expect(defaultSwimWorkouts).toHaveLength(39);
    expect(new Set(keys).size).toBe(39);
    expect([...keys].sort()).toEqual(Object.keys(expectedTotalsByKey).sort());
  });

  test('every workout total matches the spec table', () => {
    for (const workout of defaultSwimWorkouts) {
      expect({
        key: workout.builtInKey,
        total: swimWorkoutDistance(workout.sections),
      }).toEqual({
        key: workout.builtInKey,
        total: expectedTotalsByKey[workout.builtInKey],
      });
    }
  });

  test('keys encode level, week and session or recovery', () => {
    expect(swimBuiltInKey('beginner', 1, 'a')).toBe('swim-beginner-week-1-a');
    expect(swimBuiltInKey('advanced', null, null)).toBe('swim-advanced-recovery');
  });

  test('names follow the level, week and purpose form and every pool is 25 m', () => {
    for (const workout of defaultSwimWorkouts) {
      expect(workout.name).toMatch(/^(Beginner|Intermediate|Advanced) · (Week [1-6] · .+|Recovery)$/);
      expect(workout.poolLengthMeters).toBe(25);
    }
    const names = defaultSwimWorkouts.map((workout) => workout.name);
    expect(new Set(names).size).toBe(39);
    expect(names).toContain('Beginner · Week 1 · Technique');
    expect(names).toContain('Advanced · Recovery');
  });

  test('every stroke is a default swimming exercise', () => {
    const swimmingNames = new Set(
      defaultExercises.filter((exercise) => exercise.bodyPart === 'swimming').map((exercise) => exercise.name),
    );
    for (const workout of defaultSwimWorkouts) {
      for (const set of allSets(workout)) {
        expect(swimmingNames.has(set.strokeName)).toBe(true);
      }
    }
  });

  test('every distance is a multiple of 25', () => {
    for (const workout of defaultSwimWorkouts) {
      for (const set of allSets(workout)) {
        expect(set.distanceMeters % 25).toBe(0);
        expect(set.distanceMeters).toBeGreaterThan(0);
      }
    }
  });

  test('no breaststroke set or breaststroke kick set has fins', () => {
    for (const workout of defaultSwimWorkouts) {
      for (const set of allSets(workout)) {
        if (set.strokeName === 'Breaststroke' || set.strokeName === 'Breaststroke Kick') {
          expect(set.equipment).not.toContain('fins');
        }
      }
    }
  });

  test('no set uses Choice', () => {
    for (const workout of defaultSwimWorkouts) {
      for (const set of allSets(workout)) {
        expect(set.strokeName as string).not.toBe('Choice');
      }
    }
  });

  test('beginner uses fixed rest only', () => {
    const beginnerWorkouts = defaultSwimWorkouts.filter((workout) => workout.builtInKey.startsWith('swim-beginner-'));
    expect(beginnerWorkouts).toHaveLength(13);
    for (const workout of beginnerWorkouts) {
      for (const set of allSets(workout)) {
        expect(set.restMode).toBe('fixed');
        expect(set.sendOffSeconds).toBeNull();
      }
    }
  });

  test('send-off sets carry a send-off and fixed sets carry a rest', () => {
    for (const workout of defaultSwimWorkouts) {
      for (const set of allSets(workout)) {
        if (set.restMode === 'send_off') {
          expect(set.sendOffSeconds).not.toBeNull();
          expect(set.restSeconds).toBeNull();
        } else {
          expect(set.restSeconds).not.toBeNull();
          expect(set.sendOffSeconds).toBeNull();
        }
      }
    }
  });

  test('CSS test and threshold main sets are freestyle', () => {
    const pacedWorkouts = defaultSwimWorkouts.filter(
      (workout) => workout.name.endsWith('CSS test') || workout.name.endsWith('Threshold'),
    );
    expect(pacedWorkouts).toHaveLength(8);
    for (const workout of pacedWorkouts) {
      const pacedSets = mainSets(workout).filter(
        (set) => set.notes !== null && (set.notes.includes('CSS') || set.notes.includes('time trial')),
      );
      expect(pacedSets.length).toBeGreaterThan(0);
      for (const set of pacedSets) {
        expect(set.strokeName).toBe('Freestyle');
      }
    }
  });

  test('uses a warm up, a drill, kick or pre-set section, a main section and a cool down', () => {
    for (const workout of defaultSwimWorkouts) {
      const names = workout.sections.map((section) => section.name);
      expect(names).toHaveLength(4);
      expect(names[0]).toBe('Warm up');
      expect(['Drill', 'Kick', 'Pre-set']).toContain(names[1]);
      expect(names[2]).toBe('Main');
      expect(names[3]).toBe('Cool down');
    }
  });

  test('drill and swim pairs with a send-off add up to the table send-off', () => {
    const advancedKeys = ['swim-advanced-week-1-a', 'swim-advanced-week-5-a'];
    for (const key of advancedKeys) {
      const workout = defaultSwimWorkouts.find((candidate) => candidate.builtInKey === key)!;
      const drillSets = workout.sections[1].blocks[0].sets;
      expect(drillSets).toHaveLength(16);
      for (let pairIndex = 0; pairIndex < drillSets.length; pairIndex += 2) {
        const drillHalf = drillSets[pairIndex];
        const swimHalf = drillSets[pairIndex + 1];
        expect(drillHalf.strokeName).toBe(swimHalf.strokeName);
        expect(drillHalf.distanceMeters + swimHalf.distanceMeters).toBe(50);
        expect((drillHalf.sendOffSeconds ?? 0) + (swimHalf.sendOffSeconds ?? 0)).toBe(50);
      }
    }
  });

  test('library version is a hash', () => {
    expect(defaultSwimWorkoutLibraryVersion).toMatch(/^[0-9a-f]{8}$/);
  });
});
