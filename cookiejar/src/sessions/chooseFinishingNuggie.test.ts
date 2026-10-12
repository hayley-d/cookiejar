import { describe, expect, test } from 'bun:test';

import {
  chooseFinishingPresentation,
  chooseStableFinishingPresentation,
  describeFinishingCaption,
  randomFromSessionId,
} from '@/sessions/chooseFinishingNuggie';

const individual = { workoutKind: 'individual', classType: null, activityType: null, personalRecordCount: 0, newBestLabels: [] } as const;

describe('chooseFinishingPresentation', () => {
  test('a record gives the beast nuggie and the record caption', () => {
    expect(chooseFinishingPresentation({ ...individual, personalRecordCount: 2, newBestLabels: [] })).toEqual({
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
    expect(chooseFinishingPresentation({ workoutKind: 'class', classType: 'yoga', activityType: null, personalRecordCount: 0, newBestLabels: [] })).toEqual({
      nuggie: 'goodJob',
      caption: 'Namaste — class complete!',
    });
  });

  test('another class says class complete', () => {
    expect(describeFinishingCaption({ workoutKind: 'class', classType: 'spin', activityType: null, personalRecordCount: 0, newBestLabels: [] })).toBe(
      'Class complete!',
    );
    expect(describeFinishingCaption({ workoutKind: 'class', classType: null, activityType: null, personalRecordCount: 0, newBestLabels: [] })).toBe(
      'Class complete!',
    );
  });
});

describe('activities', () => {
  test('an activity says its type is complete with the good job nuggie', () => {
    expect(
      chooseFinishingPresentation({ workoutKind: 'activity', classType: null, activityType: 'hike', personalRecordCount: 0, newBestLabels: [] }),
    ).toEqual({ nuggie: 'goodJob', caption: 'Hike complete!' });
    expect(
      describeFinishingCaption({ workoutKind: 'activity', classType: null, activityType: 'run', personalRecordCount: 0, newBestLabels: [] }),
    ).toBe('Run complete!');
  });

  test('an activity without a type says activity complete', () => {
    expect(
      describeFinishingCaption({ workoutKind: 'activity', classType: null, activityType: null, personalRecordCount: 0, newBestLabels: [] }),
    ).toBe('Activity complete!');
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

  test('the finishing screen and a later summary choose the same nuggie for a session', () => {
    const classInput = { workoutKind: 'class', classType: 'spin', activityType: null, personalRecordCount: 0, newBestLabels: [] } as const;
    for (const input of [individual, classInput]) {
      const onFinishing = chooseStableFinishingPresentation(42, input);
      const onLaterSummary = chooseStableFinishingPresentation(42, input);
      expect(onLaterSummary.nuggie).toBe(onFinishing.nuggie);
    }
  });

  test('a record still gives beast', () => {
    expect(chooseStableFinishingPresentation(3, { ...individual, personalRecordCount: 1, newBestLabels: [] }).nuggie).toBe('beast');
  });
});

describe('new activity bests', () => {
  const hikeInput = {
    workoutKind: 'activity',
    classType: null,
    activityType: 'hike',
    personalRecordCount: 0,
    newBestLabels: ['Longest hike', 'Fastest pace'],
  } as const;

  test('the caption names the new bests', () => {
    expect(describeFinishingCaption(hikeInput)).toBe('New best: Longest hike, Fastest pace!');
  });

  test('a new best gets the record nuggie', () => {
    expect(chooseFinishingPresentation(hikeInput).nuggie).toBe('beast');
  });
});
