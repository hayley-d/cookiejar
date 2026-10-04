import { describe, expect, test } from 'bun:test';

import { chooseNuggie } from '@/nuggies/chooseNuggie';
import type { NuggieMoment } from '@/nuggies/NuggieMoment';

function atHour(hour: number, minute = 0): Date {
  return new Date(2026, 9, 4, hour, minute);
}

const noon = atHour(12);

describe('appLoading', () => {
  test.each([
    [0, 'sleeping'],
    [3, 'sleeping'],
    [4, 'sleeping'],
    [5, 'earlyMorning'],
    [6, 'earlyMorning'],
    [7, 'earlyMorning'],
    [8, 'workout'],
    [12, 'workout'],
    [21, 'workout'],
    [22, 'sleeping'],
    [23, 'sleeping'],
  ] as const)('at hour %i shows %s', (hour, expected) => {
    expect(chooseNuggie({ kind: 'appLoading' }, atHour(hour))).toBe(expected);
  });

  test('at 4:59 still shows sleeping', () => {
    expect(chooseNuggie({ kind: 'appLoading' }, atHour(4, 59))).toBe('sleeping');
  });

  test('at 7:59 still shows earlyMorning', () => {
    expect(chooseNuggie({ kind: 'appLoading' }, atHour(7, 59))).toBe('earlyMorning');
  });

  test('at 21:59 still shows workout', () => {
    expect(chooseNuggie({ kind: 'appLoading' }, atHour(21, 59))).toBe('workout');
  });
});

describe('sessionStarting', () => {
  test.each([
    [5, 'earlyMorning'],
    [7, 'earlyMorning'],
    [8, 'workout'],
    [18, 'workout'],
  ] as const)('starting at hour %i shows %s', (hour, expected) => {
    expect(chooseNuggie({ kind: 'sessionStarting', startsAt: atHour(hour) }, noon)).toBe(expected);
  });

  test('uses the start time rather than the current time', () => {
    expect(chooseNuggie({ kind: 'sessionStarting', startsAt: atHour(6) }, atHour(23))).toBe('earlyMorning');
  });
});

describe('sessionFinished', () => {
  test('a personal record shows beast', () => {
    expect(
      chooseNuggie({ kind: 'sessionFinished', workoutKind: 'individual', personalRecordCount: 1 }, noon),
    ).toBe('beast');
  });

  test('a personal record in a class still shows beast', () => {
    expect(chooseNuggie({ kind: 'sessionFinished', workoutKind: 'class', personalRecordCount: 2 }, noon)).toBe(
      'beast',
    );
  });

  test('a class without records shows goodJob', () => {
    expect(chooseNuggie({ kind: 'sessionFinished', workoutKind: 'class', personalRecordCount: 0 }, noon)).toBe(
      'goodJob',
    );
  });

  test.each([
    [0, 'celebrate'],
    [0.33, 'celebrate'],
    [0.34, 'celebrateAlternate'],
    [0.66, 'celebrateAlternate'],
    [0.67, 'celebrateThird'],
    [0.999, 'celebrateThird'],
  ] as const)('an individual workout with random %d shows %s', (randomValue, expected) => {
    const moment: NuggieMoment = { kind: 'sessionFinished', workoutKind: 'individual', personalRecordCount: 0 };
    expect(chooseNuggie(moment, noon, () => randomValue)).toBe(expected);
  });
});

describe('classDisplay', () => {
  test.each([
    ['yoga', 'yoga'],
    ['pilates', 'pilates'],
    ['hiking', 'hiking'],
    ['spin', 'workout'],
    ['barre', 'workout'],
    ['other', 'workout'],
  ] as const)('%s shows %s', (classType, expected) => {
    expect(chooseNuggie({ kind: 'classDisplay', classType }, noon)).toBe(expected);
  });
});

describe('fixed moments', () => {
  test.each([
    ['sessionInProgress', 'workout'],
    ['restDay', 'restDay'],
    ['lowSleep', 'tired'],
    ['stepGoalReached', 'hiking'],
    ['weeklyTargetMet', 'goodJob'],
    ['notifications', 'notification'],
    ['analytics', 'analytics'],
    ['coach', 'coach'],
  ] as const)('%s shows %s', (kind, expected) => {
    expect(chooseNuggie({ kind }, noon)).toBe(expected);
  });
});
