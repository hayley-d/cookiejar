import { chooseGreeting } from '@/coach/chooseGreeting';
import type { CoachBubble } from '@/coach/CoachBubble';
import type { CoachQuestion } from '@/coach/coachQuestions';
import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import type { Insight, InsightRule, RuleIdentifier } from '@/coach/Insight';
import { insightRules } from '@/coach/insightRules';
import type { Topic } from '@/coach/Topic';
import { openingFallback, topicFallbacks } from '@/coach/topicFallbacks';

export const maximumInsightsPerAnswer = 3;

export const rulesShownWithoutData: readonly RuleIdentifier[] = [
  'noData',
  'lowSleep',
  'elevatedRestingHeartRate',
  'recoveryGood',
  'weekAhead',
  'stalePlan',
];

export function collectInsights(snapshot: CoachSnapshot, rules: readonly InsightRule[] = insightRules): Insight[] {
  const insights = rules.flatMap((rule) => rule(snapshot));
  const hasNoData = insights.some((insight) => insight.ruleIdentifier === 'noData');
  const visibleInsights = hasNoData
    ? insights.filter((insight) => rulesShownWithoutData.includes(insight.ruleIdentifier))
    : insights;
  return [...visibleInsights].sort((first, second) => second.priority - first.priority);
}

export function insightsForTopic(
  topic: Topic,
  snapshot: CoachSnapshot,
  rules: readonly InsightRule[] = insightRules,
): Insight[] {
  return collectInsights(snapshot, rules)
    .filter((insight) => insight.topics.includes(topic))
    .slice(0, maximumInsightsPerAnswer);
}

export function insightToBubbles(insight: Insight): CoachBubble[] {
  return insight.messages.map((message, index) => ({
    text: message,
    nuggie: insight.nuggie,
    action: index === insight.messages.length - 1 ? insight.action : null,
  }));
}

export function answerQuestion(
  question: CoachQuestion,
  snapshot: CoachSnapshot,
  rules: readonly InsightRule[] = insightRules,
): CoachBubble[] {
  const insights = insightsForTopic(question.topic, snapshot, rules);
  if (insights.length === 0) {
    return [{ text: topicFallbacks[question.topic], nuggie: 'coach', action: null }];
  }
  return insights.flatMap(insightToBubbles);
}

export function openingBubbles(snapshot: CoachSnapshot, rules: readonly InsightRule[] = insightRules): CoachBubble[] {
  const greeting = chooseGreeting(snapshot.now, snapshot.profile?.displayName ?? null);
  const [topInsight] = collectInsights(snapshot, rules);
  if (topInsight === undefined || topInsight.messages.length === 0) {
    return [{ text: `${greeting} ${openingFallback}`, nuggie: 'coach', action: null }];
  }
  const [firstBubble, ...otherBubbles] = insightToBubbles(topInsight);
  return [{ ...firstBubble, text: `${greeting} ${firstBubble.text}` }, ...otherBubbles];
}
