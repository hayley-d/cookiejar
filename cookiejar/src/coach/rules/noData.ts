import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import type { Insight } from '@/coach/Insight';
import { allTopics } from '@/coach/Topic';

export const noDataPriority = 100;
export const minimumFinishedSessions = 3;

function describeSessionsToGo(finishedSessionCount: number): string {
  if (finishedSessionCount === 0) {
    return "Your first one is the hardest — I'll be cheering you on!";
  }
  const sessionsToGo = minimumFinishedSessions - finishedSessionCount;
  return `${finishedSessionCount} down, ${sessionsToGo} to go.`;
}

export function noData(snapshot: CoachSnapshot): Insight[] {
  if (snapshot.finishedSessionCount >= minimumFinishedSessions) {
    return [];
  }
  return [
    {
      ruleIdentifier: 'noData',
      topics: allTopics,
      priority: noDataPriority,
      nuggie: 'coach',
      messages: [
        "Finish a few workouts and I'll start spotting trends!",
        describeSessionsToGo(snapshot.finishedSessionCount),
      ],
      action: null,
    },
  ];
}
