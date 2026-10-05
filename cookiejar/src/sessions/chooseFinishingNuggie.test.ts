import { describe, expect, test } from 'bun:test';

import {
  chooseFinishingPresentation,
  chooseStableFinishingPresentation,
  describeFinishingCaption,
  parseFinishingNuggie,
  randomFromSessionId,
} from '@/sessions/chooseFinishingNuggie';

const individual = { workoutKind: 'individual', classType: null, personalRecordCount: 0 } as const;

describe('chooseFinishingPresentation', () => {
  test('a record gives the beast nuggie and the record caption', () => {
    expect(chooseFinishingPresentation({ ...individual, personalRecordCount: 2 })).toEqual({
      nuggie: 'beast',
      caption: 'New personal record!',
    });
  });

  test('an individual workout without a record celebrates', () => {
    const presentation = chooseFinishingPresentation(individual, () => 0.5);
    expect(presentation).toEqual({ nuggie: 'celebrateAlternate', caption: 'Workout complete!' });
  });

  test('every celebrate variant can be picked', () => {
    expect(chooseFinishingPresentation(individual, () => 0).nuggie).toBe('celebrate');
    expect(chooseFinishingPresentation(individual, () => 0.99).nuggie).toBe('celebrateThird');
  });

  test('a yoga class says namaste with the good job nuggie', () => {
    expect(chooseFinishingPresentation({ workoutKind: 'class', classType: 'yoga', personalRecordCount: 0 })).toEqual({
      nuggie: 'goodJob',
      caption: 'Namaste — class complete!',
    });
  });

  test('another class says class complete', () => {
    expect(describeFinishingCaption({ workoutKind: 'class', classType: 'spin', personalRecordCount: 0 })).toBe(
      'Class complete!',
    );
    expect(describeFinishingCaption({ workoutKind: 'class', classType: null, personalRecordCount: 0 })).toBe(
      'Class complete!',
    );
  });
});

describe('stable choice by session id', () => {
  test('the same id always gives the same nuggie', () => {
    for (let sessionId = 1; sessionId <= 20; sessionId += 1) {
      const first = chooseStableFinishingPresentation(sessionId, individual);
      const second = chooseStableFinishingPresentation(sessionId, individual);
      expect(first).toEqual(second);
    }
  });

  test('different ids reach every celebrate variant', () => {
    const nuggies = new Set<string>();
    for (let sessionId = 1; sessionId <= 60; sessionId += 1) {
      nuggies.add(chooseStableFinishingPresentation(sessionId, individual).nuggie);
    }
    expect(nuggies).toEqual(new Set(['celebrate', 'celebrateAlternate', 'celebrateThird']));
  });

  test('the deterministic random stays in range', () => {
    const random = randomFromSessionId(7);
    for (let draw = 0; draw < 50; draw += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  test('a record still gives beast', () => {
    expect(chooseStableFinishingPresentation(3, { ...individual, personalRecordCount: 1 }).nuggie).toBe('beast');
  });
});

describe('parseFinishingNuggie', () => {
  test('accepts finishing nuggies only', () => {
    expect(parseFinishingNuggie('beast')).toBe('beast');
    expect(parseFinishingNuggie('goodJob')).toBe('goodJob');
    expect(parseFinishingNuggie('coach')).toBeNull();
    expect(parseFinishingNuggie(undefined)).toBeNull();
  });
});
