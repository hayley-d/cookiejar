import { beforeEach, describe, expect, test } from 'bun:test';

import {
  bumpDataVersion,
  getDataVersion,
  resetDataVersion,
  subscribeToDataVersion,
} from '@/stores/dataVersionStore';

beforeEach(() => {
  resetDataVersion();
});

describe('dataVersionStore', () => {
  test('starts at zero', () => {
    expect(getDataVersion()).toBe(0);
  });

  test('each bump increases the version by one', () => {
    bumpDataVersion();
    bumpDataVersion();
    expect(getDataVersion()).toBe(2);
  });

  test('a bump notifies every subscriber', () => {
    let firstCalls = 0;
    let secondCalls = 0;
    const unsubscribeFirst = subscribeToDataVersion(() => {
      firstCalls += 1;
    });
    const unsubscribeSecond = subscribeToDataVersion(() => {
      secondCalls += 1;
    });
    bumpDataVersion();
    expect(firstCalls).toBe(1);
    expect(secondCalls).toBe(1);
    unsubscribeFirst();
    unsubscribeSecond();
  });

  test('an unsubscribed listener is no longer called', () => {
    let calls = 0;
    const unsubscribe = subscribeToDataVersion(() => {
      calls += 1;
    });
    unsubscribe();
    bumpDataVersion();
    expect(calls).toBe(0);
    expect(getDataVersion()).toBe(1);
  });
});
