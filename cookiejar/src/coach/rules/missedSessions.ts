import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import type { Insight, InsightAction } from '@/coach/Insight';

export const missedSessionsPriority = 70;
export const minimumMissedSessionsThisWeek = 2;
export const minimumCompletionRatio = 0.6;

function planEditorAction(snapshot: CoachSnapshot): InsightAction | null {
  if (snapshot.activePlan === null) {
    return null;
  }
  return {
    label: 'Open plan',
    destination: { screen: 'planEditor', planId: snapshot.activePlan.id },
  };
}

export function missedSessions(snapshot: CoachSnapshot): Insight[] {
  const missedThisWeekCount = snapshot.scheduledThisWeek.filter(
    (scheduledWorkout) => scheduledWorkout.date < snapshot.today && scheduledWorkout.status === 'planned',
  ).length;
  const plannedPreviousWorkouts = snapshot.scheduledPreviousFourWeeks.filter(
    (scheduledWorkout) => scheduledWorkout.planEntryId !== null,
  );
  const completedPreviousCount = plannedPreviousWorkouts.filter(
    (scheduledWorkout) => scheduledWorkout.status === 'completed',
  ).length;
  const completionRatio =
    plannedPreviousWorkouts.length === 0 ? null : completedPreviousCount / plannedPreviousWorkouts.length;

  const messages: string[] = [];
  if (missedThisWeekCount >= minimumMissedSessionsThisWeek) {
    messages.push(`You've missed ${missedThisWeekCount} sessions this week. Want to move to a lighter plan?`);
  }
  if (completionRatio !== null && completionRatio < minimumCompletionRatio) {
    messages.push(
      `You've completed ${Math.round(completionRatio * 100)}% of your planned sessions over the last 4 weeks. A lighter plan might fit better.`,
    );
  }
  if (messages.length === 0) {
    return [];
  }
  return [
    {
      ruleIdentifier: 'missedSessions',
      topics: ['week', 'improvement'],
      priority: missedSessionsPriority,
      nuggie: 'tired',
      messages,
      action: planEditorAction(snapshot),
    },
  ];
}
