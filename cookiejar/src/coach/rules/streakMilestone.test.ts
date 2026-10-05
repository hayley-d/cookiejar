import { describe, expect, test } from 'bun:test';

import { createCoachSnapshot, createScheduledWorkout } from '@/coach/coachSnapshotFixture';
import { streakMilestone, streakMilestonePriority } from '@/coach/rules/streakMilestone';
import type { Profile } from '@/types/Profile';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

const profile: Profile = {
  id: 1,
  displayName: null,
  birthDate: null,
  sex: null,
  heightCentimetres: null,
  goal: null,
  weeklyWorkoutTarget: 3,
  dailyStepGoal: 8000,
  updatedAt: '',
};

function completedWorkouts(dates: string[]): ScheduledWorkout[] {
  return dates.map((date) => createScheduledWorkout({ date, status: 'completed' }));
}

const thisWeekMet = completedWorkouts(['2026-10-05', '2026-10-06', '2026-10-07']);
const thisWeekNotMet = [
  ...completedWorkouts(['2026-10-05', '2026-10-06']),
  createScheduledWorkout({ date: '2026-10-09', status: 'planned' }),
];
const lastWeekMet = completedWorkouts(['2026-09-28', '2026-09-29', '2026-09-30']);
const twoWeeksAgoMet = completedWorkouts(['2026-09-21', '2026-09-22', '2026-09-23']);
const threeWeeksAgoMet = completedWorkouts(['2026-09-14', '2026-09-15', '2026-09-16']);
const fourWeeksAgoMet = completedWorkouts(['2026-09-07', '2026-09-08', '2026-09-09']);
const lastWeekMissed = [
  ...completedWorkouts(['2026-09-28', '2026-09-29']),
  createScheduledWorkout({ date: '2026-09-30', status: 'planned' }),
  createScheduledWorkout({ date: '2026-10-02', status: 'planned' }),
];

function messagesFor(thisWeek: ScheduledWorkout[], previous: ScheduledWorkout[], weeklyWorkoutTarget = 3) {
  return streakMilestone(
    createCoachSnapshot({
      profile: { ...profile, weeklyWorkoutTarget },
      scheduledThisWeek: thisWeek,
      scheduledPreviousFourWeeks: previous,
    }),
  ).flatMap((insight) => insight.messages);
}

describe('streakMilestone', () => {
  test('fires for the progress and week topics with the goodJob nuggie and no action', () => {
    const insights = streakMilestone(createCoachSnapshot({ profile, scheduledThisWeek: thisWeekMet }));
    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({
      ruleIdentifier: 'streakMilestone',
      topics: ['progress', 'week'],
      priority: streakMilestonePriority,
      nuggie: 'goodJob',
      action: null,
    });
    expect(streakMilestonePriority).toBe(50);
  });

  test('fires when only this week met the target', () => {
    expect(messagesFor(thisWeekMet, [])).toEqual(['You hit your weekly target this week! 🔥']);
  });

  test('does not fire when this week is short and there is no streak', () => {
    expect(messagesFor(thisWeekNotMet, [])).toEqual([]);
  });

  test('fires when exactly the target is completed and not one short', () => {
    expect(messagesFor(thisWeekMet, [])).toHaveLength(1);
    expect(messagesFor(thisWeekNotMet, [])).toEqual([]);
  });

  test('agrees with the Home tile when every planned workout is done below the target', () => {
    expect(messagesFor(completedWorkouts(['2026-10-05', '2026-10-06']), [], 5)).toHaveLength(1);
  });

  test('fires on 3 completed previous weeks when this week is not met yet', () => {
    expect(messagesFor(thisWeekNotMet, [...lastWeekMet, ...twoWeeksAgoMet, ...threeWeeksAgoMet])).toEqual([
      '3 weeks in a row hitting your target! 🔥',
    ]);
  });

  test('does not fire on 2 completed previous weeks when this week is not met', () => {
    expect(messagesFor(thisWeekNotMet, [...lastWeekMet, ...twoWeeksAgoMet])).toEqual([]);
  });

  test('counts this week in the streak when it is met', () => {
    expect(messagesFor(thisWeekMet, [...lastWeekMet, ...twoWeeksAgoMet])).toEqual([
      '3 weeks in a row hitting your target! 🔥',
    ]);
    expect(
      messagesFor(thisWeekMet, [...lastWeekMet, ...twoWeeksAgoMet, ...threeWeeksAgoMet, ...fourWeeksAgoMet]),
    ).toEqual(['5 weeks in a row hitting your target! 🔥']);
  });

  test('stops counting at the first week that missed', () => {
    expect(messagesFor(thisWeekMet, [...lastWeekMissed, ...twoWeeksAgoMet, ...threeWeeksAgoMet])).toEqual([
      'You hit your weekly target this week! 🔥',
    ]);
    expect(messagesFor(thisWeekNotMet, [...lastWeekMissed, ...twoWeeksAgoMet, ...threeWeeksAgoMet])).toEqual([]);
  });

  test('does not fire without a profile', () => {
    expect(streakMilestone(createCoachSnapshot({ scheduledThisWeek: thisWeekMet }))).toEqual([]);
  });
});
