import { describe, expect, test } from 'bun:test';

import { createCoachSnapshot, createScheduledWorkout } from '@/coach/coachSnapshotFixture';
import { weekAhead, weekAheadPriority } from '@/coach/rules/weekAhead';

const wednesdayNineAm = new Date(2026, 9, 7, 9, 0);

function weekAheadMessages(scheduledThisWeek: ReturnType<typeof createScheduledWorkout>[], now = wednesdayNineAm) {
  const [insight] = weekAhead(createCoachSnapshot({ now, scheduledThisWeek }));
  return insight.messages;
}

describe('weekAhead', () => {
  test('always fires for the week topic with the workout nuggie and the calendar action', () => {
    const insights = weekAhead(createCoachSnapshot());
    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({
      ruleIdentifier: 'weekAhead',
      topics: ['week'],
      priority: weekAheadPriority,
      nuggie: 'workout',
      action: { label: 'Open calendar', destination: { screen: 'calendar' } },
    });
    expect(weekAheadPriority).toBe(10);
  });

  test('says nothing is planned when the week is empty', () => {
    expect(weekAheadMessages([])).toEqual([
      'Nothing planned this week yet.',
      "Pick a plan and I'll keep you on track!",
    ]);
  });

  test('counts planned and done workouts and names the next one tomorrow', () => {
    const messages = weekAheadMessages([
      createScheduledWorkout({ date: '2026-10-05', status: 'completed' }),
      createScheduledWorkout({ date: '2026-10-06', status: 'completed' }),
      createScheduledWorkout({ date: '2026-10-08', name: 'Leg Day' }),
      createScheduledWorkout({ date: '2026-10-09' }),
      createScheduledWorkout({ date: '2026-10-11' }),
    ]);
    expect(messages).toEqual(['This week: 5 workouts planned, 2 done.', 'Next: Leg Day tomorrow at 17:30.']);
  });

  test('counts an unplanned completed session as planned and done', () => {
    const messages = weekAheadMessages([
      createScheduledWorkout({ date: '2026-10-06', status: 'completed', isPlanned: false }),
    ]);
    expect(messages[0]).toBe('This week: 1 workout planned, 1 done.');
  });

  test('names a later day by its weekday', () => {
    const messages = weekAheadMessages([createScheduledWorkout({ date: '2026-10-10', name: 'Pull Day' })]);
    expect(messages[1]).toBe('Next: Pull Day on Saturday at 17:30.');
  });

  test('a workout later today is next, including one at the current minute', () => {
    expect(weekAheadMessages([createScheduledWorkout({ date: '2026-10-07', timeOfDay: '09:00' })])[1]).toBe(
      'Next: Push Day today at 09:00.',
    );
  });

  test('a workout earlier today is not next', () => {
    const messages = weekAheadMessages([
      createScheduledWorkout({ date: '2026-10-07', timeOfDay: '08:59', name: 'Early Run' }),
      createScheduledWorkout({ date: '2026-10-09', name: 'Leg Day' }),
    ]);
    expect(messages[1]).toBe('Next: Leg Day on Friday at 17:30.');
  });

  test('a past missed workout is not next', () => {
    const messages = weekAheadMessages([createScheduledWorkout({ date: '2026-10-06' })]);
    expect(messages).toEqual(['This week: 1 workout planned, 0 done.', 'Nothing else planned this week.']);
  });

  test('an in-progress or completed workout is not next', () => {
    const messages = weekAheadMessages([
      createScheduledWorkout({ date: '2026-10-07', status: 'inProgress' }),
      createScheduledWorkout({ date: '2026-10-08', status: 'completed' }),
    ]);
    expect(messages[1]).toBe('Nothing else planned this week.');
  });
});
