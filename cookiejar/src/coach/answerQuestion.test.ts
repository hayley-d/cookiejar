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
import { createCoachSnapshot, createScheduledWorkout } from '@/coach/coachSnapshotFixture';
import type { Insight, InsightRule, RuleIdentifier } from '@/coach/Insight';
import { allTopics, type Topic } from '@/coach/Topic';
import { topicFallbacks } from '@/coach/topicFallbacks';
import type { Profile } from '@/types/Profile';

function createInsight(
  ruleIdentifier: RuleIdentifier,
  priority: number,
  topics: Topic[],
  text: string = ruleIdentifier,
): Insight {
  return { ruleIdentifier, topics, priority, nuggie: 'coach', messages: [text], action: null };
}

function ruleReturning(...insights: Insight[]): InsightRule {
  return () => insights;
}

function questionFor(topic: Topic): CoachQuestion {
  const question = coachQuestions.find((candidate) => candidate.topic === topic);
  if (question === undefined) {
    throw new Error(`No question for ${topic}`);
  }
  return question;
}

const profileNamedHayley: Profile = {
  id: 1,
  displayName: 'Hayley',
  birthDate: null,
  sex: null,
  heightCentimetres: null,
  goal: null,
  weeklyWorkoutTarget: 4,
  dailyStepGoal: 10000,
  updatedAt: '',
};

describe('coachQuestions', () => {
  test('has one prompt per topic in chip order', () => {
    expect(coachQuestions.map((question) => question.topic)).toEqual([...allTopics]);
    expect(coachQuestions.map((question) => question.prompt)).toEqual([
      'How am I progressing?',
      'Where can I improve?',
      'Should I change things up?',
      "How's my recovery?",
      "What's my week looking like?",
    ]);
  });
});

describe('insightsForTopic', () => {
  test('keeps only the insights whose topics include the question topic', () => {
    const rules = [
      ruleReturning(createInsight('plateau', 60, ['changeItUp', 'improvement'])),
      ruleReturning(createInsight('lowSleep', 90, ['recovery'])),
    ];
    const snapshot = createCoachSnapshot();
    expect(insightsForTopic('improvement', snapshot, rules).map((insight) => insight.ruleIdentifier)).toEqual([
      'plateau',
    ]);
    expect(insightsForTopic('changeItUp', snapshot, rules).map((insight) => insight.ruleIdentifier)).toEqual([
      'plateau',
    ]);
    expect(insightsForTopic('recovery', snapshot, rules).map((insight) => insight.ruleIdentifier)).toEqual([
      'lowSleep',
    ]);
  });

  test('sorts by priority, highest first, and takes the top 3', () => {
    const rules = [
      ruleReturning(createInsight('strengthTrend', 30, ['progress'])),
      ruleReturning(createInsight('newPersonalRecords', 80, ['progress'])),
      ruleReturning(createInsight('streakMilestone', 50, ['progress', 'week'])),
      ruleReturning(createInsight('lowSleep', 90, ['recovery'])),
      ruleReturning(createInsight('plateau', 60, ['progress'])),
    ];
    const snapshot = createCoachSnapshot();
    expect(maximumInsightsPerAnswer).toBe(3);
    expect(insightsForTopic('progress', snapshot, rules).map((insight) => insight.priority)).toEqual([80, 60, 50]);
  });
});

describe('collectInsights noData behaviour', () => {
  const everyRuleIdentifier: RuleIdentifier[] = [
    'noData',
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
    'recoveryGood',
    'strengthTrend',
    'weekAhead',
  ];

  test('with noData, keeps only noData and the rules that need no workout history', () => {
    const rules = everyRuleIdentifier.map((ruleIdentifier) =>
      ruleReturning(createInsight(ruleIdentifier, 1, ['progress'])),
    );
    const kept = collectInsights(createCoachSnapshot(), rules).map((insight) => insight.ruleIdentifier);
    expect(new Set(kept)).toEqual(
      new Set<RuleIdentifier>([
        'noData',
        'lowSleep',
        'elevatedRestingHeartRate',
        'recoveryGood',
        'weekAhead',
        'stalePlan',
      ]),
    );
    expect(rulesShownWithoutData).toHaveLength(6);
  });

  test('without noData, keeps every rule', () => {
    const rules = everyRuleIdentifier
      .filter((ruleIdentifier) => ruleIdentifier !== 'noData')
      .map((ruleIdentifier) => ruleReturning(createInsight(ruleIdentifier, 1, ['progress'])));
    expect(collectInsights(createCoachSnapshot(), rules)).toHaveLength(13);
  });

  test('with fewer than 3 sessions, every question leads with noData', () => {
    const snapshot = createCoachSnapshot({ finishedSessionCount: 2 });
    for (const question of coachQuestions) {
      expect(answerQuestion(question, snapshot)[0].text).toBe("Finish a few workouts and I'll start spotting trends!");
    }
  });

  test('with fewer than 3 sessions, the week question also answers with weekAhead', () => {
    const snapshot = createCoachSnapshot({ finishedSessionCount: 0 });
    const answer = answerQuestion(questionFor('week'), snapshot);
    expect(answer.map((bubble) => bubble.nuggie)).toEqual(['coach', 'coach', 'workout', 'workout']);
  });
});

describe('answerQuestion', () => {
  test('turns each message into a bubble with the action on the last bubble of its insight', () => {
    const insight: Insight = {
      ruleIdentifier: 'plateau',
      topics: ['changeItUp'],
      priority: 60,
      nuggie: 'analytics',
      messages: ['First', 'Second'],
      action: { label: 'See Squat history', destination: { screen: 'exerciseHistory', exerciseId: 4 } },
    };
    expect(answerQuestion(questionFor('changeItUp'), createCoachSnapshot(), [ruleReturning(insight)])).toEqual([
      { text: 'First', nuggie: 'analytics', action: null },
      { text: 'Second', nuggie: 'analytics', action: insight.action },
    ]);
  });

  test('uses the topic fallback when no insight matches', () => {
    for (const topic of allTopics) {
      expect(answerQuestion(questionFor(topic), createCoachSnapshot(), [])).toEqual([
        { text: topicFallbacks[topic], nuggie: 'coach', action: null },
      ]);
    }
  });

  test('every topic has its own fallback', () => {
    for (const topic of allTopics) {
      expect(topicFallbacks[topic].length).toBeGreaterThan(0);
    }
  });

  test('the registry answers the week question with weekAhead once there is data', () => {
    const snapshot = createCoachSnapshot({
      scheduledThisWeek: [createScheduledWorkout({ date: '2026-10-08', name: 'Leg Day' })],
    });
    const answer = answerQuestion(questionFor('week'), snapshot);
    expect(answer.map((bubble) => bubble.text)).toEqual([
      'This week: 1 workout planned, 0 done.',
      'Next: Leg Day tomorrow at 17:30.',
    ]);
    expect(answer[1].action).toEqual({ label: 'Open calendar', destination: { screen: 'calendar' } });
  });

  test('the registry falls back for topics without insights once there is data', () => {
    expect(answerQuestion(questionFor('progress'), createCoachSnapshot())[0].text).toBe(topicFallbacks.progress);
  });
});

describe('openingBubbles', () => {
  test('greets by name with the single top insight across every topic', () => {
    const rules = [
      ruleReturning(createInsight('weekAhead', 10, ['week'], 'Week text')),
      ruleReturning(createInsight('lowSleep', 90, ['recovery'], 'Only 5h 40m sleep.')),
    ];
    const snapshot = createCoachSnapshot({ profile: profileNamedHayley });
    expect(openingBubbles(snapshot, rules)).toEqual([
      { text: 'Good Noop! Only 5h 40m sleep.', nuggie: 'coach', action: null },
    ]);
  });

  test('greets without a name when there is no profile', () => {
    const rules = [ruleReturning(createInsight('weekAhead', 10, ['week'], 'Week text'))];
    expect(openingBubbles(createCoachSnapshot(), rules)[0].text).toBe('Good Noop! Week text');
  });

  test('opens with the noData insight with fewer than 3 sessions', () => {
    const bubbles = openingBubbles(createCoachSnapshot({ finishedSessionCount: 1, profile: profileNamedHayley }));
    expect(bubbles.map((bubble) => bubble.text)).toEqual([
      "Good Noop! Finish a few workouts and I'll start spotting trends!",
      '1 down, 2 to go.',
    ]);
    expect(bubbles[0].nuggie).toBe('coach');
  });

  test('falls back to a friendly line when no rule fires', () => {
    expect(openingBubbles(createCoachSnapshot(), [])).toEqual([
      { text: 'Good Noop! Everything looks on track — keep it up!', nuggie: 'coach', action: null },
    ]);
  });
});
