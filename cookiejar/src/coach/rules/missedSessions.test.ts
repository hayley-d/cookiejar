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
      messages: ["Not noopy… Push Day got skipped this week. Today's free, want to squeeze one in?"],
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
    expect(insights[0].messages[0]).toBe(
      "Only 5 of 9 planned sessions done in the last 4 weeks. That's not noopy. A lighter plan might fit you better.",
    );
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

  test('ad-hoc completed workouts do not lift the completion ratio', () => {
    const adHocCompleted = Array.from({ length: 10 }, () =>
      createScheduledWorkout({ date: '2026-09-20', status: 'completed', isPlanned: false }),
    );
    expect(
      missedSessions(
        createCoachSnapshot({ scheduledPreviousFourWeeks: [...previousWorkouts(1, 5), ...adHocCompleted] }),
      ),
    ).toHaveLength(1);
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

describe('missedSessions copy', () => {
  const namedWeek = [
    createScheduledWorkout({ date: '2026-10-05', name: 'Leg Day' }),
    createScheduledWorkout({ date: '2026-10-06', name: 'Push Day' }),
    createScheduledWorkout({ date: '2026-10-07', name: 'Pull Day' }),
    createScheduledWorkout({ date: '2026-10-08', name: 'Core' }),
  ];

  test('names the skipped workouts and the next free day', () => {
    expect(missedSessions(createCoachSnapshot({ scheduledThisWeek: namedWeek }))[0].messages).toEqual([
      "Not noopy… Leg Day and Push Day got skipped this week. Friday's free, want to squeeze one in?",
    ]);
  });

  test('the second variant counts the skipped workouts', () => {
    const snapshot = createCoachSnapshot({ now: new Date(2026, 9, 8, 9, 0), scheduledThisWeek: namedWeek });
    expect(missedSessions(snapshot)[0].messages).toEqual([
      "Oh my noop, 2 sessions missed this week (Leg Day, Push Day). Friday's open for a catch-up.",
    ]);
  });

  test('suggests a lighter plan when no free day is left', () => {
    const fullWeek = [
      ...namedWeek,
      ...['2026-10-09', '2026-10-10', '2026-10-11'].map((date) => createScheduledWorkout({ date })),
    ];
    expect(missedSessions(createCoachSnapshot({ scheduledThisWeek: fullWeek }))[0].messages).toEqual([
      'Not noopy… Leg Day and Push Day got skipped this week. Maybe a lighter plan would fit better?',
    ]);
  });

  test('the second 4-week variant shows the percentage', () => {
    const snapshot = createCoachSnapshot({ now: new Date(2026, 9, 8, 9, 0), scheduledPreviousFourWeeks: previousWorkouts(5, 9) });
    expect(missedSessions(snapshot)[0].messages).toEqual([
      '56% of your planned sessions done over 4 weeks. A lighter plan could make things noopier.',
    ]);
  });
});
