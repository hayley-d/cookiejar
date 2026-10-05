import { describe, expect, test } from 'bun:test';

import { chooseGeneralTip, chooseTipOfTheDay } from '@/coach/chooseTipOfTheDay';
import { createCoachSnapshot } from '@/coach/coachSnapshotFixture';
import { generalTips } from '@/coach/generalTips';
import type { Insight, InsightRule } from '@/coach/Insight';
import type { Topic } from '@/coach/Topic';

function createInsight(topics: Topic[], priority: number, message: string): Insight {
  return { ruleIdentifier: 'plateau', topics, priority, nuggie: 'coach', messages: [message, 'second'], action: null };
}

function ruleReturning(...insights: Insight[]): InsightRule {
  return () => insights;
}

describe('chooseTipOfTheDay', () => {
  test('picks the highest priority insight from recovery, changeItUp and progress', () => {
    const rule = ruleReturning(
      createInsight(['progress'], 50, 'progress tip'),
      createInsight(['recovery'], 90, 'recovery tip'),
      createInsight(['changeItUp'], 60, 'change tip'),
    );
    expect(chooseTipOfTheDay(createCoachSnapshot(), [rule])).toBe('recovery tip');
  });

  test('uses the first message of the chosen insight', () => {
    const rule = ruleReturning(createInsight(['changeItUp'], 60, 'change tip'));
    expect(chooseTipOfTheDay(createCoachSnapshot(), [rule])).toBe('change tip');
  });

  test('ignores insights from week-only and improvement-only topics', () => {
    const rule = ruleReturning(
      createInsight(['week'], 99, 'week tip'),
      createInsight(['improvement'], 98, 'improvement tip'),
      createInsight(['progress'], 10, 'progress tip'),
    );
    expect(chooseTipOfTheDay(createCoachSnapshot(), [rule])).toBe('progress tip');
  });

  test('falls back to the general tip when there is no matching insight', () => {
    const snapshot = createCoachSnapshot();
    const rule = ruleReturning(createInsight(['week'], 99, 'week tip'));
    expect(chooseTipOfTheDay(snapshot, [rule])).toBe(chooseGeneralTip(snapshot.now));
    expect(chooseTipOfTheDay(snapshot, [])).toBe(chooseGeneralTip(snapshot.now));
  });

  test('returns the general tip when noData applies (fewer than 3 finished sessions)', () => {
    const snapshot = createCoachSnapshot({ finishedSessionCount: 1 });
    const noDataInsight: Insight = {
      ruleIdentifier: 'noData',
      topics: ['recovery', 'changeItUp', 'progress'],
      priority: 100,
      nuggie: 'coach',
      messages: ['Finish a few workouts and I\'ll start spotting trends!', '1 down, 2 to go.'],
      action: null,
    };
    const otherInsight = createInsight(['recovery'], 50, 'recovery tip');
    const rule = ruleReturning(noDataInsight, otherInsight);
    const result = chooseTipOfTheDay(snapshot, [rule]);
    expect(result).toBe(chooseGeneralTip(snapshot.now));
    expect(result).not.toBe(noDataInsight.messages[0]);
  });
});

describe('chooseGeneralTip', () => {
  test('is stable within a day', () => {
    expect(chooseGeneralTip(new Date(2026, 9, 7, 0, 5))).toBe(chooseGeneralTip(new Date(2026, 9, 7, 23, 55)));
  });

  test('rotates across days', () => {
    const tips = Array.from({ length: generalTips.length }, (_, day) => chooseGeneralTip(new Date(2026, 0, 1 + day)));
    expect(new Set(tips).size).toBe(generalTips.length);
    expect(chooseGeneralTip(new Date(2026, 9, 7))).not.toBe(chooseGeneralTip(new Date(2026, 9, 8)));
  });

  test('holds about twenty tips', () => {
    expect(generalTips.length).toBeGreaterThanOrEqual(18);
  });
});
