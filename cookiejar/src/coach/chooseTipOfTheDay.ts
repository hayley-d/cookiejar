import { collectInsights } from '@/coach/answerQuestion';
import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import { generalTips } from '@/coach/generalTips';
import type { InsightRule } from '@/coach/Insight';
import { insightRules } from '@/coach/insightRules';
import type { Topic } from '@/coach/Topic';

export const tipTopics: readonly Topic[] = ['recovery', 'changeItUp', 'progress'];

const millisecondsPerDay = 24 * 60 * 60 * 1000;

export function dayOfYear(date: Date): number {
  const startOfYearUtc = Date.UTC(date.getFullYear(), 0, 1);
  const dateUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((dateUtc - startOfYearUtc) / millisecondsPerDay) + 1;
}

export function chooseGeneralTip(date: Date, tips: readonly string[] = generalTips): string {
  return tips[dayOfYear(date) % tips.length];
}

export function chooseTipOfTheDay(snapshot: CoachSnapshot, rules: readonly InsightRule[] = insightRules): string {
  const topInsight = collectInsights(snapshot, rules).find(
    (insight) => insight.messages.length > 0 && insight.topics.some((topic) => tipTopics.includes(topic)),
  );
  return topInsight?.messages[0] ?? chooseGeneralTip(snapshot.now);
}
