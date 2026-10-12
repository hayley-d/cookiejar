import { describe, expect, test } from 'bun:test';

import {
  createDefaultSwimDetails,
  createSwimEditorReducer,
  findSwimSet,
  loadSwimDetails,
  stripSwimKeys,
} from '@/swimming/swimEditorReducer';
import { describeSwimRounds, describeSwimSet } from '@/swimming/describeSwimSet';
import { swimSectionDistance, swimWorkoutDistance } from '@/swimming/swimDistance';
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

describe('blocks, rounds and rest', () => {
  function detailsWithOneSet() {
    const { createKey, reduce } = createReducer();
    const initialDetails = createDefaultSwimDetails(createKey);
    const details = reduce(initialDetails, { type: 'setAdded', sectionKey: initialDetails.sections[1].key, stroke: freestyle });
    return { reduce, details, block: details.sections[1].blocks[0] };
  }

  test('adding a set to a block groups it with the existing set and clears equipment and notes', () => {
    const { reduce, details, block } = detailsWithOneSet();
    const withEquipment = reduce(details, {
      type: 'setChanged',
      setKey: block.sets[0].key,
      changes: { equipment: ['fins'], notes: 'easy', repetitions: 4 },
    });
    const next = reduce(withEquipment, { type: 'setAddedToBlock', blockKey: block.key });
    const sets = next.sections[1].blocks[0].sets;
    expect(next.sections[1].blocks).toHaveLength(1);
    expect(sets).toHaveLength(2);
    expect(sets[1]).toMatchObject({ exerciseName: 'Freestyle', repetitions: 4, equipment: [], notes: null });
    expect(sets[1].key).not.toBe(sets[0].key);
  });

  test('rounds never drop below one and multiply the block distance', () => {
    const { reduce, details, block } = detailsWithOneSet();
    const threeRounds = reduce(details, { type: 'blockRoundsChanged', blockKey: block.key, rounds: 3 });
    expect(threeRounds.sections[1].blocks[0].rounds).toBe(3);
    expect(swimWorkoutDistance(threeRounds.sections)).toBe(300);
    const clamped = reduce(details, { type: 'blockRoundsChanged', blockKey: block.key, rounds: 0 });
    expect(clamped.sections[1].blocks[0].rounds).toBe(1);
  });

  test('a block rest can be set and cleared', () => {
    const { reduce, details, block } = detailsWithOneSet();
    const withRest = reduce(details, { type: 'blockRestChanged', blockKey: block.key, restAfterSeconds: 60 });
    expect(withRest.sections[1].blocks[0].restAfterSeconds).toBe(60);
    const cleared = reduce(withRest, { type: 'blockRestChanged', blockKey: block.key, restAfterSeconds: null });
    expect(cleared.sections[1].blocks[0].restAfterSeconds).toBeNull();
  });

  test('a block that falls back to one round and one set loses its block rest', () => {
    const { reduce, details, block } = detailsWithOneSet();
    const grouped = reduce(details, { type: 'setAddedToBlock', blockKey: block.key });
    const withRest = reduce(grouped, { type: 'blockRestChanged', blockKey: block.key, restAfterSeconds: 60 });
    const secondSetKey = withRest.sections[1].blocks[0].sets[1].key;
    const next = reduce(withRest, { type: 'setRemoved', setKey: secondSetKey });
    expect(next.sections[1].blocks[0].sets).toHaveLength(1);
    expect(next.sections[1].blocks[0].restAfterSeconds).toBeNull();
  });

  test('unknown block keys leave the details unchanged', () => {
    const { reduce, details } = detailsWithOneSet();
    expect(reduce(details, { type: 'setAddedToBlock', blockKey: 'missing' })).toBe(details);
  });
});

describe('saving trims names and notes', () => {
  test('a blank section name falls back to its position and names are trimmed', () => {
    const { createKey, reduce } = createReducer();
    let details = createDefaultSwimDetails(createKey);
    details = reduce(details, { type: 'sectionRenamed', sectionKey: details.sections[0].key, name: '   ' });
    details = reduce(details, { type: 'sectionRenamed', sectionKey: details.sections[1].key, name: '  Kick set ' });
    expect(stripSwimKeys(details).map((section) => section.name)).toEqual(['Section 1', 'Kick set', 'Cool down']);
  });

  test('a blank note is saved as no note', () => {
    const { createKey, reduce } = createReducer();
    let details = createDefaultSwimDetails(createKey);
    details = reduce(details, { type: 'setAdded', sectionKey: details.sections[0].key, stroke: freestyle });
    const setKey = details.sections[0].blocks[0].sets[0].key;
    details = reduce(details, { type: 'setChanged', setKey, changes: { notes: '  ' } });
    expect(stripSwimKeys(details)[0].blocks[0].sets[0].notes).toBeNull();
    details = reduce(details, { type: 'setChanged', setKey, changes: { notes: ' easy ' } });
    expect(stripSwimKeys(details)[0].blocks[0].sets[0].notes).toBe('easy');
  });
});

describe('the phase document example workout', () => {
  test('totals 100 m, 1,500 m, 100 m and 1,700 m and describes each set', () => {
    const { createKey, reduce } = createReducer();
    const backstroke = { id: 2, name: 'Backstroke' };
    const choice = { id: 3, name: 'Choice' };
    let details = createDefaultSwimDetails(createKey);
    const [warmUp, main, coolDown] = details.sections.map((section) => section.key);

    details = reduce(details, { type: 'setAdded', sectionKey: warmUp, stroke: freestyle });
    let setKey = details.sections[0].blocks[0].sets[0].key;
    details = reduce(details, {
      type: 'setChanged',
      setKey,
      changes: { repetitions: 2, distanceMeters: 50, restMode: 'fixed', restSeconds: 30 },
    });

    details = reduce(details, { type: 'setAdded', sectionKey: main, stroke: backstroke });
    const mainBlockKey = details.sections[1].blocks[0].key;
    setKey = details.sections[1].blocks[0].sets[0].key;
    details = reduce(details, {
      type: 'setChanged',
      setKey,
      changes: { repetitions: 4, distanceMeters: 100, restMode: 'send_off', sendOffSeconds: 105, equipment: ['fins'] },
    });
    details = reduce(details, { type: 'setAddedToBlock', blockKey: mainBlockKey });
    setKey = details.sections[1].blocks[0].sets[1].key;
    details = reduce(details, {
      type: 'setChanged',
      setKey,
      changes: {
        exerciseId: 1,
        exerciseName: 'Freestyle Kick',
        repetitions: 4,
        distanceMeters: 25,
        restMode: 'fixed',
        restSeconds: null,
        sendOffSeconds: null,
        equipment: ['kickboard'],
      },
    });
    details = reduce(details, { type: 'blockRoundsChanged', blockKey: mainBlockKey, rounds: 3 });

    details = reduce(details, { type: 'setAdded', sectionKey: coolDown, stroke: choice });

    const sections = stripSwimKeys(details);
    expect(sections.map((section) => swimSectionDistance(section))).toEqual([100, 1500, 100]);
    expect(swimWorkoutDistance(sections)).toBe(1700);
    expect(sections[1].blocks).toHaveLength(1);
    expect(sections[1].blocks[0].rounds).toBe(3);
    expect(sections[1].blocks[0].sets.map((set) => describeSwimSet(set))).toEqual([
      '4×100 m Backstroke @ 1:45 · Fins',
      '4×25 m Freestyle Kick · Kickboard',
    ]);
    expect(describeSwimSet(sections[0].blocks[0].sets[0])).toBe('2×50 m Freestyle · rest 0:30');
    expect(describeSwimRounds(sections[1].blocks[0].rounds)).toBe('3 rounds');
  });
});

describe('rest normalisation', () => {
  function singleSetDetails() {
    const { createKey, reduce } = createReducer();
    const initialDetails = createDefaultSwimDetails(createKey);
    const details = reduce(initialDetails, { type: 'setAdded', sectionKey: initialDetails.sections[1].key, stroke: freestyle });
    return { reduce, details, block: details.sections[1].blocks[0] };
  }

  test('stepping a one set block back to one round clears its block rest', () => {
    const { reduce, details, block } = singleSetDetails();
    const twoRounds = reduce(details, { type: 'blockRoundsChanged', blockKey: block.key, rounds: 2 });
    const withRest = reduce(twoRounds, { type: 'blockRestChanged', blockKey: block.key, restAfterSeconds: 60 });
    expect(withRest.sections[1].blocks[0].restAfterSeconds).toBe(60);
    const backToOne = reduce(withRest, { type: 'blockRoundsChanged', blockKey: block.key, rounds: 1 });
    expect(backToOne.sections[1].blocks[0].restAfterSeconds).toBeNull();
  });

  test('rounds can be raised on a single set block', () => {
    const { reduce, details, block } = singleSetDetails();
    const next = reduce(details, { type: 'blockRoundsChanged', blockKey: block.key, rounds: 4 });
    expect(next.sections[1].blocks[0].rounds).toBe(4);
    expect(next.sections[1].blocks[0].sets).toHaveLength(1);
  });

  test('a zero rest after is stored as no rest', () => {
    const { reduce, details, block } = singleSetDetails();
    const twoRounds = reduce(details, { type: 'blockRoundsChanged', blockKey: block.key, rounds: 2 });
    const zeroBlockRest = reduce(twoRounds, { type: 'blockRestChanged', blockKey: block.key, restAfterSeconds: 0 });
    expect(zeroBlockRest.sections[1].blocks[0].restAfterSeconds).toBeNull();
    const setKey = block.sets[0].key;
    const zeroSetRest = reduce(details, { type: 'setChanged', setKey, changes: { restAfterSeconds: 0 } });
    expect(findSwimSet(zeroSetRest, setKey)?.restAfterSeconds).toBeNull();
    const zeroFixedRest = reduce(details, { type: 'setChanged', setKey, changes: { restMode: 'fixed', restSeconds: 0 } });
    expect(findSwimSet(zeroFixedRest, setKey)?.restSeconds).toBeNull();
    const positiveSetRest = reduce(details, { type: 'setChanged', setKey, changes: { restAfterSeconds: 45 } });
    expect(findSwimSet(positiveSetRest, setKey)?.restAfterSeconds).toBe(45);
  });
});
