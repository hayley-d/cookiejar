import { describe, expect, test } from 'bun:test';

import { createCoachSnapshot } from '@/coach/coachSnapshotFixture';
import { stalePlan, stalePlanPriority } from '@/coach/rules/stalePlan';
import type { PlanWithEntries } from '@/types/PlanWithEntries';

function planStartingOn(startsOn: string | null): PlanWithEntries {
  return {
    id: 7,
    name: 'Summer Strength',
    isActive: true,
    startsOn,
    createdAt: '',
    entries: [],
  };
}

function insightsFor(startsOn: string | null) {
  return stalePlan(createCoachSnapshot({ activePlan: planStartingOn(startsOn) }));
}

describe('stalePlan', () => {
  test('fires with the changeItUp topic and a plan editor action', () => {
    const insights = insightsFor('2026-08-26');
    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({
      ruleIdentifier: 'stalePlan',
      topics: ['changeItUp'],
      priority: stalePlanPriority,
      nuggie: 'coach',
      action: { destination: { screen: 'planEditor', planId: 7 } },
    });
    expect(insights[0].messages).toEqual([
      'Ohh my noops, 6 weeks of Summer Strength! Time for a new phase? Duplicate it and tweak it.',
    ]);
    expect(stalePlanPriority).toBe(55);
  });

  test('fires at exactly 6 weeks', () => {
    expect(insightsFor('2026-08-26')).toHaveLength(1);
  });

  test('does not fire one day short of 6 weeks', () => {
    expect(insightsFor('2026-08-27')).toEqual([]);
  });

  test('never fires when starts_on is null', () => {
    expect(insightsFor(null)).toEqual([]);
  });

  test('does not fire without an active plan', () => {
    expect(stalePlan(createCoachSnapshot())).toEqual([]);
  });
});

describe('stalePlan copy', () => {
  test('the second variant on alternate days', () => {
    const snapshot = createCoachSnapshot({ now: new Date(2026, 9, 8, 9, 0), activePlan: planStartingOn('2026-08-26') });
    expect(stalePlan(snapshot)[0].messages).toEqual([
      'Summer Strength has had a good 6-week run. Duplicate it and switch things up for a noopy new phase.',
    ]);
  });

  test('suggests a deload from 8 weeks', () => {
    expect(insightsFor('2026-08-19')[0].messages[0]).not.toContain('deload');
    expect(insightsFor('2026-08-12')[0].messages).toEqual([
      'Ohh my noops, 8 weeks of Summer Strength! Time for a new phase? Duplicate it and tweak it. Start with a deload week, then go fresh.',
    ]);
  });
});
