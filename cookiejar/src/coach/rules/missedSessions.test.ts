import { describe, expect, test } from 'bun:test';

import { createCoachSnapshot, createScheduledWorkout } from '@/coach/coachSnapshotFixture';
import { missedSessions, missedSessionsPriority } from '@/coach/rules/missedSessions';
import type { PlanWithEntries } from '@/types/PlanWithEntries';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

const activePlan: PlanWithEntries = {
  id: 3,
  name: 'Plan',
  isActive: true,
  startsOn: null,
  createdAt: '',
  entries: [],
};

function previousWorkouts(completedCount: number, plannedCount: number): ScheduledWorkout[] {
  return Array.from({ length: plannedCount }, (_, index) =>
    createScheduledWorkout({
      date: '2026-09-20',
      status: index < completedCount ? 'completed' : 'planned',
    }),
  );
}

const missedTwice = [
  createScheduledWorkout({ date: '2026-10-05' }),
  createScheduledWorkout({ date: '2026-10-06' }),
  createScheduledWorkout({ date: '2026-10-09' }),
];

describe('missedSessions', () => {
  test('fires for the week and improvement topics with the tired nuggie and the plan editor action', () => {
    const insights = missedSessions(createCoachSnapshot({ activePlan, scheduledThisWeek: missedTwice }));
    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({
      ruleIdentifier: 'missedSessions',
      topics: ['week', 'improvement'],
      priority: missedSessionsPriority,
      nuggie: 'tired',
      messages: ["You've missed 2 sessions this week. Want to move to a lighter plan?"],
      action: { destination: { screen: 'planEditor', planId: 3 } },
    });
    expect(missedSessionsPriority).toBe(70);
  });

  test('2 missed this week fires and 1 does not', () => {
    expect(missedSessions(createCoachSnapshot({ scheduledThisWeek: missedTwice.slice(0, 2) }))).toHaveLength(1);
    expect(missedSessions(createCoachSnapshot({ scheduledThisWeek: missedTwice.slice(0, 1) }))).toEqual([]);
  });

  test('does not count planned workouts dated today or later, or completed ones', () => {
    const scheduledThisWeek = [
      createScheduledWorkout({ date: '2026-10-05', status: 'completed' }),
      createScheduledWorkout({ date: '2026-10-06' }),
      createScheduledWorkout({ date: '2026-10-07' }),
      createScheduledWorkout({ date: '2026-10-08' }),
    ];
    expect(missedSessions(createCoachSnapshot({ scheduledThisWeek }))).toEqual([]);
  });

  test('fires under 60% completion over 4 weeks', () => {
    const insights = missedSessions(
      createCoachSnapshot({
        scheduledPreviousFourWeeks: previousWorkouts(5, 9),
      }),
    );
    expect(insights).toHaveLength(1);
    expect(insights[0].messages[0]).toContain('56%');
    expect(insights[0].action).toBeNull();
  });

  test('exactly 60% completion does not fire', () => {
    expect(
      missedSessions(
        createCoachSnapshot({
          scheduledPreviousFourWeeks: previousWorkouts(3, 5),
        }),
      ),
    ).toEqual([]);
  });

  test('never fires on completion when nothing was planned', () => {
    expect(missedSessions(createCoachSnapshot({ scheduledPreviousFourWeeks: [] }))).toEqual([]);
  });

  test('lists both reasons in one insight', () => {
    const insights = missedSessions(
      createCoachSnapshot({
        scheduledThisWeek: missedTwice,
        scheduledPreviousFourWeeks: previousWorkouts(0, 4),
      }),
    );
    expect(insights).toHaveLength(1);
    expect(insights[0].messages).toHaveLength(2);
  });
});
