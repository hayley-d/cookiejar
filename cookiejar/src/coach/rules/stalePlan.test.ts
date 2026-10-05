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
    expect(insights[0].messages[0]).toContain('Summer Strength');
    expect(insights[0].messages[0]).toContain('6 weeks');
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
