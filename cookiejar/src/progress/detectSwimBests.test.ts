import { describe, expect, test } from 'bun:test';

import { describeSwimBests, detectSwimBests } from '@/progress/detectSwimBests';
import type { SwimLog } from '@/types/SwimLog';

function buildLog(overrides: Partial<SwimLog> = {}): SwimLog {
  return {
    startedAt: '2026-10-01T08:00:00.000Z',
    durationSeconds: 1800,
    distanceMeters: 1000,
    strokeDistances: [{ strokeName: 'Freestyle', distanceMeters: 1000 }],
    ...overrides,
  };
}

describe('detectSwimBests', () => {
  test('the first swim is not a best', () => {
    expect(detectSwimBests(buildLog(), [])).toEqual([]);
  });

  test('a tie is not a best', () => {
    expect(detectSwimBests(buildLog(), [buildLog()])).toEqual([]);
  });

  test('a longer swim at the same pace is a longest swim best', () => {
    expect(detectSwimBests(buildLog({ distanceMeters: 2000, durationSeconds: 3600 }), [buildLog()])).toEqual([
      'longestSwim',
    ]);
  });

  test('a faster pace over the same distance is a fastest pace best', () => {
    expect(detectSwimBests(buildLog({ durationSeconds: 1500 }), [buildLog()])).toEqual(['fastestPace']);
  });

  test('a swim can set both bests', () => {
    expect(detectSwimBests(buildLog({ distanceMeters: 2000, durationSeconds: 3000 }), [buildLog()])).toEqual([
      'longestSwim',
      'fastestPace',
    ]);
  });

  test('a best must strictly beat every earlier swim', () => {
    expect(
      detectSwimBests(buildLog({ distanceMeters: 1500, durationSeconds: 3000 }), [
        buildLog({ distanceMeters: 1000 }),
        buildLog({ distanceMeters: 1500 }),
      ]),
    ).toEqual([]);
  });

  test('a faster pace under 400 m is not a best', () => {
    expect(detectSwimBests(buildLog({ distanceMeters: 300, durationSeconds: 100 }), [buildLog()])).toEqual([]);
  });

  test('earlier swims under 400 m do not count towards pace', () => {
    expect(
      detectSwimBests(buildLog({ durationSeconds: 3000 }), [buildLog({ distanceMeters: 300, durationSeconds: 60 })]),
    ).toEqual(['longestSwim']);
  });

  test('exactly 400 m counts for pace on both sides', () => {
    expect(
      detectSwimBests(buildLog({ distanceMeters: 400, durationSeconds: 400 }), [
        buildLog({ distanceMeters: 400, durationSeconds: 800 }),
      ]),
    ).toEqual(['fastestPace']);
  });

  test('a swim with no swum distance records nothing', () => {
    expect(detectSwimBests(buildLog({ distanceMeters: 0, strokeDistances: [] }), [buildLog()])).toEqual([]);
  });

  test('earlier swims with no swum distance are not recorded values', () => {
    expect(detectSwimBests(buildLog(), [buildLog({ distanceMeters: 0, strokeDistances: [] })])).toEqual([]);
  });
});

describe('describeSwimBests', () => {
  test('names each best', () => {
    expect(describeSwimBests(['longestSwim', 'fastestPace'])).toEqual(['Longest swim', 'Fastest pace']);
  });
});
