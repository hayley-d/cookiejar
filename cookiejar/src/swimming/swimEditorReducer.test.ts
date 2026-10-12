import { describe, expect, test } from 'bun:test';

import {
  createDefaultSwimDetails,
  createSwimEditorReducer,
  findSwimSet,
  loadSwimDetails,
  stripSwimKeys,
} from '@/swimming/swimEditorReducer';
import { swimWorkoutDistance } from '@/swimming/swimDistance';
import type { SwimSection } from '@/swimming/swimTypes';
import { createKeyCounter } from '@/workouts/workoutEditorReducer';

const freestyle = { id: 1, name: 'Freestyle' };

function createReducer() {
  const createKey = createKeyCounter('swim');
  return { createKey, reduce: createSwimEditorReducer(createKey) };
}

describe('createDefaultSwimDetails', () => {
  test('starts with Warm up, Main and Cool down in a 25 m pool', () => {
    const details = createDefaultSwimDetails(createKeyCounter('swim'));
    expect(details.sections.map((section) => section.name)).toEqual(['Warm up', 'Main', 'Cool down']);
    expect(details.poolLengthMeters).toBe(25);
    expect(details.sections.every((section) => section.blocks.length === 0)).toBe(true);
  });
});

describe('swimEditorReducer', () => {
  test('adding a set puts it in its own single round block with no rest after', () => {
    const { createKey, reduce } = createReducer();
    const details = createDefaultSwimDetails(createKey);
    const next = reduce(details, { type: 'setAdded', sectionKey: details.sections[1].key, stroke: freestyle });
    const block = next.sections[1].blocks[0];
    expect(block.rounds).toBe(1);
    expect(block.restAfterSeconds).toBeNull();
    expect(block.sets).toHaveLength(1);
    expect(block.sets[0]).toMatchObject({ exerciseId: 1, exerciseName: 'Freestyle', repetitions: 1, distanceMeters: 100 });
  });

  test('a new set copies the previous set of its section', () => {
    const { createKey, reduce } = createReducer();
    let details = createDefaultSwimDetails(createKey);
    const sectionKey = details.sections[1].key;
    details = reduce(details, { type: 'setAdded', sectionKey, stroke: freestyle });
    const firstSetKey = details.sections[1].blocks[0].sets[0].key;
    details = reduce(details, {
      type: 'setChanged',
      setKey: firstSetKey,
      changes: { repetitions: 4, distanceMeters: 50, restSeconds: 30 },
    });
    details = reduce(details, { type: 'setAdded', sectionKey, stroke: { id: 2, name: 'Breaststroke' } });
    expect(details.sections[1].blocks[1].sets[0]).toMatchObject({
      exerciseName: 'Freestyle',
      repetitions: 4,
      distanceMeters: 50,
      restSeconds: 30,
    });
  });

  test('changing and removing a set', () => {
    const { createKey, reduce } = createReducer();
    let details = createDefaultSwimDetails(createKey);
    details = reduce(details, { type: 'setAdded', sectionKey: details.sections[0].key, stroke: freestyle });
    const setKey = details.sections[0].blocks[0].sets[0].key;
    details = reduce(details, {
      type: 'setChanged',
      setKey,
      changes: { restMode: 'send_off', sendOffSeconds: 105, equipment: ['fins'], notes: 'build' },
    });
    expect(findSwimSet(details, setKey)).toMatchObject({ restMode: 'send_off', sendOffSeconds: 105, notes: 'build' });
    details = reduce(details, { type: 'setRemoved', setKey });
    expect(details.sections[0].blocks).toEqual([]);
    expect(findSwimSet(details, setKey)).toBeNull();
  });

  test('actions that change nothing return the same details', () => {
    const { createKey, reduce } = createReducer();
    const details = createDefaultSwimDetails(createKey);
    expect(reduce(details, { type: 'setRemoved', setKey: 'missing' })).toBe(details);
    expect(reduce(details, { type: 'setChanged', setKey: 'missing', changes: { repetitions: 2 } })).toBe(details);
    expect(reduce(details, { type: 'sectionRemoved', sectionKey: 'missing' })).toBe(details);
    expect(reduce(details, { type: 'sectionMoved', sectionKey: details.sections[0].key, offset: -1 })).toBe(details);
    expect(reduce(details, { type: 'sectionMoved', sectionKey: details.sections[2].key, offset: 1 })).toBe(details);
    expect(reduce(details, { type: 'setAdded', sectionKey: 'missing', stroke: freestyle })).toBe(details);
  });

  test('sections can be renamed, added, moved and removed', () => {
    const { createKey, reduce } = createReducer();
    let details = createDefaultSwimDetails(createKey);
    details = reduce(details, { type: 'sectionRenamed', sectionKey: details.sections[1].key, name: 'Kick set' });
    details = reduce(details, { type: 'sectionAdded' });
    expect(details.sections.map((section) => section.name)).toEqual(['Warm up', 'Kick set', 'Cool down', 'Section 4']);
    details = reduce(details, { type: 'sectionMoved', sectionKey: details.sections[3].key, offset: -1 });
    expect(details.sections.map((section) => section.name)).toEqual(['Warm up', 'Kick set', 'Section 4', 'Cool down']);
    details = reduce(details, { type: 'sectionRemoved', sectionKey: details.sections[2].key });
    expect(details.sections.map((section) => section.name)).toEqual(['Warm up', 'Kick set', 'Cool down']);
  });

  test('details such as the pool length can change', () => {
    const { createKey, reduce } = createReducer();
    const details = reduce(createDefaultSwimDetails(createKey), {
      type: 'detailsChanged',
      changes: { poolLengthMeters: 50 },
    });
    expect(details.poolLengthMeters).toBe(50);
  });
});

describe('loading and stripping keys', () => {
  const sections: SwimSection[] = [
    {
      name: 'Main',
      blocks: [
        {
          rounds: 3,
          restAfterSeconds: 60,
          sets: [
            {
              exerciseId: 5,
              exerciseName: 'Backstroke',
              repetitions: 4,
              distanceMeters: 100,
              restMode: 'send_off',
              restSeconds: null,
              sendOffSeconds: 105,
              restAfterSeconds: 20,
              equipment: ['fins', 'paddles'],
              notes: 'descend 1-4',
            },
          ],
        },
      ],
    },
  ];

  test('every column survives a load and strip round trip', () => {
    const details = loadSwimDetails({ poolLengthMeters: 50, description: 'x', imageUrl: '', sections }, createKeyCounter('swim'));
    expect(stripSwimKeys(details)).toEqual(sections);
    expect(details.poolLengthMeters).toBe(50);
    expect(swimWorkoutDistance(details.sections)).toBe(1200);
  });

  test('loaded sections, blocks and sets get distinct keys', () => {
    const details = loadSwimDetails({ poolLengthMeters: 25, description: '', imageUrl: '', sections }, createKeyCounter('swim'));
    const keys = [details.sections[0].key, details.sections[0].blocks[0].key, details.sections[0].blocks[0].sets[0].key];
    expect(new Set(keys).size).toBe(3);
  });
});
