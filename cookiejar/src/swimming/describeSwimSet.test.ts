import { describe, expect, test } from 'bun:test';

import { describeSwimBlockRest, describeSwimRounds, describeSwimSet } from '@/swimming/describeSwimSet';
import { formatSwimTime } from '@/swimming/formatSwimTime';

const baseSet = {
  exerciseName: 'Freestyle',
  repetitions: 2,
  distanceMeters: 50,
  restMode: 'fixed' as const,
  restSeconds: null,
  sendOffSeconds: null,
  restAfterSeconds: null,
  equipment: [],
  notes: null,
};

describe('formatSwimTime', () => {
  test('shows minutes and padded seconds', () => {
    expect(formatSwimTime(105)).toBe('1:45');
    expect(formatSwimTime(30)).toBe('0:30');
    expect(formatSwimTime(5)).toBe('0:05');
    expect(formatSwimTime(600)).toBe('10:00');
  });
});

describe('describeSwimSet', () => {
  test('a fixed rest set reads like a whiteboard', () => {
    expect(describeSwimSet({ ...baseSet, restSeconds: 30 })).toBe('2×50 m Freestyle · rest 0:30');
  });

  test('a send-off set shows the interval', () => {
    expect(
      describeSwimSet({
        ...baseSet,
        exerciseName: 'Backstroke',
        repetitions: 4,
        distanceMeters: 100,
        restMode: 'send_off',
        sendOffSeconds: 105,
      }),
    ).toBe('4×100 m Backstroke @ 1:45');
  });

  test('equipment follows the timing', () => {
    expect(
      describeSwimSet({
        ...baseSet,
        exerciseName: 'Backstroke',
        repetitions: 4,
        distanceMeters: 100,
        restMode: 'send_off',
        sendOffSeconds: 105,
        equipment: ['fins'],
      }),
    ).toBe('4×100 m Backstroke @ 1:45 · Fins');
  });

  test('several pieces of equipment are listed in order', () => {
    expect(describeSwimSet({ ...baseSet, equipment: ['paddles', 'pull_buoy'] })).toBe(
      '2×50 m Freestyle · Paddles, Pull Buoy',
    );
  });

  test('a set without rest is just the work', () => {
    expect(describeSwimSet({ ...baseSet, repetitions: 1, distanceMeters: 100, exerciseName: 'Choice' })).toBe(
      '1×100 m Choice',
    );
  });

  test('a rest after the set is added at the end', () => {
    expect(describeSwimSet({ ...baseSet, restSeconds: 30, restAfterSeconds: 60 })).toBe(
      '2×50 m Freestyle · rest 0:30 · then rest 1:00',
    );
  });

  test('a note closes the description in quotes', () => {
    expect(describeSwimSet({ ...baseSet, equipment: ['fins'], restAfterSeconds: 60, notes: 'descend 1-4' })).toBe(
      '2×50 m Freestyle · Fins · then rest 1:00 · "descend 1-4"',
    );
  });

  test('a blank note is left out', () => {
    expect(describeSwimSet({ ...baseSet, notes: '   ' })).toBe('2×50 m Freestyle');
  });

  test('a fixed rest set ignores a stale send-off value', () => {
    expect(describeSwimSet({ ...baseSet, sendOffSeconds: 90 })).toBe('2×50 m Freestyle');
  });
});

describe('describeSwimRounds and describeSwimBlockRest', () => {
  test('a single round has no heading', () => {
    expect(describeSwimRounds(1)).toBeNull();
    expect(describeSwimRounds(3)).toBe('3 rounds');
  });

  test('a block rest reads as a time', () => {
    expect(describeSwimBlockRest(null)).toBeNull();
    expect(describeSwimBlockRest(90)).toBe('Rest 1:30');
  });
});
