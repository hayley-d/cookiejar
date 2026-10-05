import { collectInsights } from '@/coach/answerQuestion';
import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import { generalTips } from '@/coach/generalTips';
import type { InsightRule } from '@/coach/Insight';
import { insightRules } from '@/coach/insightRules';
import type { Topic } from '@/coach/Topic';
import { dayOfYear } from '@/dates/dayOfYear';

export const tipTopics: readonly Topic[] = ['recovery', 'changeItUp', 'progress'];

export function chooseGeneralTip(date: Date, tips: readonly string[] = generalTips): string {
  return tips[dayOfYear(date) % tips.length];
}

export function chooseTipOfTheDay(snapshot: CoachSnapshot, rules: readonly InsightRule[] = insightRules): string {
  const topInsight = collectInsights(snapshot, rules).find(
    (insight) => insight.messages.length > 0 && insight.topics.some((topic) => tipTopics.includes(topic)),
  );
  return topInsight?.messages[0] ?? chooseGeneralTip(snapshot.now);
}
