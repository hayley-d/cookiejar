import { describe, expect, test } from 'bun:test';

import {
  answerQuestion,
  collectInsights,
  insightsForTopic,
  maximumInsightsPerAnswer,
  openingBubbles,
  rulesShownWithoutData,
} from '@/coach/answerQuestion';
import { coachQuestions, type CoachQuestion } from '@/coach/coachQuestions';
import {
  createCoachSnapshot,
  createFullyLoadedCoachSnapshot,
  createHealthSnapshot,
  createSeededCoachSnapshot,
} from '@/coach/coachSnapshotFixture';
import type { RuleIdentifier } from '@/coach/Insight';
import { allTopics, type Topic } from '@/coach/Topic';
import { topicFallbacks } from '@/coach/topicFallbacks';

function questionFor(topic: Topic): CoachQuestion {
  const question = coachQuestions.find((candidate) => candidate.topic === topic);
  if (question === undefined) {
    throw new Error(`No question for ${topic}`);
  }
  return question;
}

function identifiersFor(topic: Topic, snapshot = createFullyLoadedCoachSnapshot()): RuleIdentifier[] {
  return insightsForTopic(topic, snapshot).map((insight) => insight.ruleIdentifier);
}

describe('seeded acceptance fixture', () => {
  const snapshot = createSeededCoachSnapshot();

  test('reports the squat stuck for 3 weeks as a plateau under "Should I change things up?"', () => {
    const question = questionFor('changeItUp');
    expect(question.prompt).toBe('Should I change things up?');
    const bubbles = answerQuestion(question, snapshot);
    expect(bubbles[0].text).toContain('Squat has been stuck for 3 weeks');
    expect(bubbles[0].nuggie).toBe('coach');
    expect(bubbles[0].action).toEqual({
      label: 'See Squat history',
      destination: { screen: 'exerciseHistory', exerciseId: 2 },
    });
    expect(identifiersFor('changeItUp', snapshot)[0]).toBe('plateau');
  });

  test('reports a plan older than 6 weeks as stale under "Should I change things up?"', () => {
    const bubbles = answerQuestion(questionFor('changeItUp'), snapshot);
    const staleBubble = bubbles.find((bubble) => bubble.text.includes('Summer Strength'));
    expect(staleBubble?.text).toContain('6 weeks');
    expect(staleBubble?.nuggie).toBe('coach');
    expect(staleBubble?.action?.destination).toEqual({
      screen: 'planEditor',
      planId: 7,
    });
    expect(identifiersFor('changeItUp', snapshot)).toEqual(['plateau', 'stalePlan']);
  });

  test('reports sleep under 6 hours as low sleep with the tired nuggie', () => {
    const bubbles = answerQuestion(questionFor('recovery'), snapshot);
    expect(bubbles).toHaveLength(1);
    expect(bubbles[0].text).toContain('Go lighter today');
    expect(bubbles[0].nuggie).toBe('tired');
    expect(identifiersFor('recovery', snapshot)).toEqual(['lowSleep']);
  });

  test('reports a new record with the beast nuggie', () => {
    const bubbles = answerQuestion(questionFor('progress'), snapshot);
    expect(bubbles[0].text).toContain('New record on Squat');
    expect(bubbles[0].nuggie).toBe('beast');
    expect(identifiersFor('progress', snapshot)[0]).toBe('newPersonalRecords');
  });

  test('the greeting leads with the highest priority insight across every topic', () => {
    const [topInsight] = collectInsights(snapshot);
    expect(topInsight.ruleIdentifier).toBe('lowSleep');
    const bubbles = openingBubbles(snapshot);
    expect(bubbles[0].text).toBe('Morning! Only 5h 40m sleep. Go lighter today.');
    expect(bubbles[0].nuggie).toBe('tired');
  });

  test('without low sleep the greeting falls to the new record', () => {
    const rested = createSeededCoachSnapshot({ healthLastFourteenDays: [] });
    const bubbles = openingBubbles(rested);
    expect(bubbles[0].text).toContain('New record on Squat');
    expect(bubbles[0].nuggie).toBe('beast');
  });
});

describe('priority ordering across all rules', () => {
  test('the fully loaded snapshot fires every rule except noData and recoveryGood, highest priority first', () => {
    const insights = collectInsights(createFullyLoadedCoachSnapshot());
    expect(insights.map((insight) => insight.ruleIdentifier)).toEqual([
      'lowSleep',
      'elevatedRestingHeartRate',
      'newPersonalRecords',
      'missedSessions',
      'trainingLoadSpike',
      'plateau',
      'stalePlan',
      'streakMilestone',
      'muscleBalance',
      'noRecentWeighIn',
      'strengthTrend',
      'weekAhead',
    ]);
    expect(insights.map((insight) => insight.priority)).toEqual([90, 85, 80, 70, 65, 60, 55, 50, 45, 40, 30, 10]);
  });

  test('recoveryGood sits between noRecentWeighIn and strengthTrend when rested', () => {
    const rested = createFullyLoadedCoachSnapshot();
    const restedSnapshot = {
      ...rested,
      healthLastFourteenDays: rested.healthLastFourteenDays.map((healthSnapshot) =>
        healthSnapshot.date === '2026-10-07'
          ? createHealthSnapshot('2026-10-07', {
              sleepMinutes: 480,
              restingHeartRate: 58,
            })
          : healthSnapshot,
      ),
    };
    const identifiers = collectInsights(restedSnapshot).map((insight) => insight.ruleIdentifier);
    expect(identifiers).not.toContain('lowSleep');
    expect(identifiers).not.toContain('elevatedRestingHeartRate');
    expect(identifiers.indexOf('recoveryGood')).toBe(identifiers.indexOf('noRecentWeighIn') + 1);
    expect(identifiers.indexOf('strengthTrend')).toBe(identifiers.indexOf('recoveryGood') + 1);
  });

  test('the greeting picks the highest priority across every topic', () => {
    const snapshot = createFullyLoadedCoachSnapshot();
    const bubbles = openingBubbles(snapshot);
    expect(bubbles[0].text).toBe('Morning Hayley! Only 5h 40m sleep. Go lighter today.');
    expect(bubbles[0].nuggie).toBe('tired');
    const withoutRecovery = { ...snapshot, healthLastFourteenDays: [] };
    expect(openingBubbles(withoutRecovery)[0].text).toContain('New record on Squat');
  });

  test('each question returns at most 3 insights, highest priority first', () => {
    const snapshot = createFullyLoadedCoachSnapshot();
    for (const topic of allTopics) {
      const insights = insightsForTopic(topic, snapshot);
      expect(insights.length).toBeLessThanOrEqual(maximumInsightsPerAnswer);
      expect(insights.length).toBeGreaterThan(0);
      const priorities = insights.map((insight) => insight.priority);
      expect(priorities).toEqual([...priorities].sort((first, second) => second - first));
    }
  });

  test('each question returns its top three by priority', () => {
    expect(identifiersFor('recovery')).toEqual(['lowSleep', 'elevatedRestingHeartRate', 'trainingLoadSpike']);
    expect(identifiersFor('improvement')).toEqual(['missedSessions', 'plateau', 'muscleBalance']);
    expect(identifiersFor('changeItUp')).toEqual(['plateau', 'stalePlan']);
    expect(identifiersFor('progress')).toEqual(['newPersonalRecords', 'streakMilestone', 'strengthTrend']);
    expect(identifiersFor('week')).toEqual(['missedSessions', 'streakMilestone', 'weekAhead']);
  });
});

describe('fewer than 3 finished sessions', () => {
  const loadedSnapshot = createFullyLoadedCoachSnapshot();

  test('only noData and the agreed exceptions remain', () => {
    const newcomer = { ...loadedSnapshot, finishedSessionCount: 2 };
    const identifiers = collectInsights(newcomer).map((insight) => insight.ruleIdentifier);
    expect(identifiers).toEqual(['noData', 'lowSleep', 'elevatedRestingHeartRate', 'stalePlan', 'weekAhead']);
    for (const identifier of identifiers) {
      expect(rulesShownWithoutData).toContain(identifier);
    }
  });

  test('recoveryGood also remains when rested', () => {
    const newcomer = createSeededCoachSnapshot({
      finishedSessionCount: 1,
      healthLastFourteenDays: [
        createHealthSnapshot('2026-10-07', {
          sleepMinutes: 480,
          restingHeartRate: 58,
        }),
        createHealthSnapshot('2026-10-06', { restingHeartRate: 60 }),
      ],
    });
    const identifiers = collectInsights(newcomer).map((insight) => insight.ruleIdentifier);
    expect(identifiers).toEqual(['noData', 'stalePlan', 'recoveryGood', 'weekAhead']);
  });

  test('every question starts with the noData message', () => {
    const newcomer = { ...loadedSnapshot, finishedSessionCount: 0 };
    for (const question of coachQuestions) {
      const bubbles = answerQuestion(question, newcomer);
      expect(bubbles[0].text).toBe("Finish a few workouts and I'll start spotting trends!");
      expect(bubbles[0].text).not.toBe(topicFallbacks[question.topic]);
    }
  });

  test('the greeting leads with the noData message', () => {
    const newcomer = createCoachSnapshot({ finishedSessionCount: 2 });
    expect(openingBubbles(newcomer)[0].text).toBe("Morning! Finish a few workouts and I'll start spotting trends!");
  });
});
