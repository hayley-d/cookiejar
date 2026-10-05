import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import { chooseVariant } from '@/coach/chooseVariant';
import type { Insight, InsightAction } from '@/coach/Insight';
import { joinNames } from '@/coach/joinNames';
import { addDays } from '@/dates/addDays';
import { weekdayNamesFromSunday } from '@/dates/calendarNames';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { toLocalDateString } from '@/dates/toLocalDateString';

export const missedSessionsPriority = 70;
export const minimumMissedSessionsThisWeek = 2;
export const minimumCompletionRatio = 0.6;

const daysPerWeek = 7;

function planEditorAction(snapshot: CoachSnapshot): InsightAction | null {
  if (snapshot.activePlan === null) {
    return null;
  }
  return {
    label: 'Open plan',
    destination: { screen: 'planEditor', planId: snapshot.activePlan.id },
  };
}

function nextFreeDayLabel(snapshot: CoachSnapshot): string | null {
  const weekStart = parseLocalDateString(snapshot.weekStartDate);
  const scheduledDates = new Set(snapshot.scheduledThisWeek.map((scheduledWorkout) => scheduledWorkout.date));
  for (let dayIndex = 0; dayIndex < daysPerWeek; dayIndex += 1) {
    const date = addDays(weekStart, dayIndex);
    const dateString = toLocalDateString(date);
    if (dateString < snapshot.today || scheduledDates.has(dateString)) {
      continue;
    }
    return dateString === snapshot.today ? 'Today' : weekdayNamesFromSunday[date.getDay()];
  }
  return null;
}

function missedThisWeekMessage(snapshot: CoachSnapshot, missedCount: number, missedNames: readonly string[]): string {
  const freeDayLabel = nextFreeDayLabel(snapshot);
  const lighterPlanEnding = 'Maybe a lighter plan would fit better?';
  return chooseVariant(snapshot.now, [
    `Not noopy… ${joinNames(missedNames, 'and')} got skipped this week. ${
      freeDayLabel === null ? lighterPlanEnding : `${freeDayLabel}'s free, want to squeeze one in?`
    }`,
    `Oh my noop, ${missedCount} sessions missed this week (${missedNames.join(', ')}). ${
      freeDayLabel === null ? lighterPlanEnding : `${freeDayLabel}'s open for a catch-up.`
    }`,
  ]);
}

export function missedSessions(snapshot: CoachSnapshot): Insight[] {
  const missedThisWeek = snapshot.scheduledThisWeek.filter(
    (scheduledWorkout) => scheduledWorkout.date < snapshot.today && scheduledWorkout.status === 'planned',
  );
  const missedNames = [...new Set(missedThisWeek.map((scheduledWorkout) => scheduledWorkout.workout.name))];
  const plannedPreviousWorkouts = snapshot.scheduledPreviousFourWeeks.filter(
    (scheduledWorkout) => scheduledWorkout.planEntryId !== null,
  );
  const completedPreviousCount = plannedPreviousWorkouts.filter(
    (scheduledWorkout) => scheduledWorkout.status === 'completed',
  ).length;
  const completionRatio =
    plannedPreviousWorkouts.length === 0 ? null : completedPreviousCount / plannedPreviousWorkouts.length;

  const messages: string[] = [];
  if (missedThisWeek.length >= minimumMissedSessionsThisWeek) {
    messages.push(missedThisWeekMessage(snapshot, missedThisWeek.length, missedNames));
  }
  if (completionRatio !== null && completionRatio < minimumCompletionRatio) {
    messages.push(
      chooseVariant(snapshot.now, [
        `Only ${completedPreviousCount} of ${plannedPreviousWorkouts.length} planned sessions done in the last 4 weeks. That's not noopy. A lighter plan might fit you better.`,
        `${Math.round(completionRatio * 100)}% of your planned sessions done over 4 weeks. A lighter plan could make things noopier.`,
      ]),
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
