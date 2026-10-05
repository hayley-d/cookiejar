import { describe, expect, test } from 'bun:test';

import { buildWorkoutReminders } from '@/notifications/buildWorkoutReminders';
import type { NotificationSettings } from '@/notifications/NotificationSettings';
import type { ScheduledWorkout, ScheduledWorkoutStatus } from '@/types/ScheduledWorkout';

const now = new Date(2026, 9, 6, 12, 0);

const defaultSettings: NotificationSettings = {
  areWorkoutRemindersEnabled: true,
  reminderLeadMinutes: 30,
  areRestAlertsEnabled: true,
  isWeeklySummaryEnabled: true,
};

type ScheduledWorkoutOverrides = {
  date?: string;
  timeOfDay?: string | null;
  planEntryId?: number | null;
  status?: ScheduledWorkoutStatus;
  sessionId?: number | null;
  workoutId?: number | null;
  name?: string;
};

function makeScheduledWorkout(overrides: ScheduledWorkoutOverrides = {}): ScheduledWorkout {
  return {
    date: overrides.date ?? '2026-10-06',
    timeOfDay: overrides.timeOfDay === undefined ? '17:30' : overrides.timeOfDay,
    planEntryId: overrides.planEntryId === undefined ? 12 : overrides.planEntryId,
    status: overrides.status ?? 'planned',
    sessionId: overrides.sessionId ?? null,
    workout: {
      id: overrides.workoutId === undefined ? 4 : overrides.workoutId,
      name: overrides.name ?? 'Push Day',
      kind: 'individual',
      classType: null,
      durationMinutes: null,
      imageUrl: null,
      exerciseCount: 3,
      targetSetCount: 9,
      targetRestSeconds: 540,
    },
  };
}

function byDate(scheduledWorkouts: ScheduledWorkout[]): Map<string, ScheduledWorkout[]> {
  const scheduledWorkoutsByDate = new Map<string, ScheduledWorkout[]>();
  for (const scheduledWorkout of scheduledWorkouts) {
    const onDate = scheduledWorkoutsByDate.get(scheduledWorkout.date) ?? [];
    onDate.push(scheduledWorkout);
    scheduledWorkoutsByDate.set(scheduledWorkout.date, onDate);
  }
  return scheduledWorkoutsByDate;
}

describe('buildWorkoutReminders', () => {
  test('builds a reminder with its content, route, nuggie and sound', () => {
    const reminders = buildWorkoutReminders(byDate([makeScheduledWorkout()]), defaultSettings, now);
    expect(reminders).toEqual([
      {
        identifier: 'workout-reminder:2026-10-06:12',
        title: 'Workout reminder',
        body: "Push Day at 17:30 — Nuggie's ready when you are!",
        nuggie: 'notification',
        route: '/workout/4?date=2026-10-06&planEntryId=12',
        fireAt: new Date(2026, 9, 6, 17, 0),
        playsSound: true,
      },
    ]);
  });

  test('fires at the workout time minus each lead time', () => {
    const scheduledWorkoutsByDate = byDate([makeScheduledWorkout()]);
    const fireTimeFor = (reminderLeadMinutes: 15 | 30 | 60) =>
      buildWorkoutReminders(scheduledWorkoutsByDate, { ...defaultSettings, reminderLeadMinutes }, now)[0].fireAt;
    expect(fireTimeFor(15)).toEqual(new Date(2026, 9, 6, 17, 15));
    expect(fireTimeFor(30)).toEqual(new Date(2026, 9, 6, 17, 0));
    expect(fireTimeFor(60)).toEqual(new Date(2026, 9, 6, 16, 30));
  });

  test('includes today and the 13 days after it, and nothing outside', () => {
    const reminders = buildWorkoutReminders(
      byDate([
        makeScheduledWorkout({ date: '2026-10-05', planEntryId: 1 }),
        makeScheduledWorkout({ date: '2026-10-06', planEntryId: 2 }),
        makeScheduledWorkout({ date: '2026-10-19', planEntryId: 3 }),
        makeScheduledWorkout({ date: '2026-10-20', planEntryId: 4 }),
      ]),
      defaultSettings,
      now,
    );
    expect(reminders.map((reminder) => reminder.identifier)).toEqual([
      'workout-reminder:2026-10-06:2',
      'workout-reminder:2026-10-19:3',
    ]);
  });

  test('skips started and completed workouts', () => {
    const reminders = buildWorkoutReminders(
      byDate([
        makeScheduledWorkout({ planEntryId: 1, status: 'inProgress', sessionId: 7 }),
        makeScheduledWorkout({ planEntryId: 2, status: 'completed', sessionId: 8 }),
      ]),
      defaultSettings,
      now,
    );
    expect(reminders).toEqual([]);
  });

  test('skips workouts without a time of day or a plan entry', () => {
    const reminders = buildWorkoutReminders(
      byDate([makeScheduledWorkout({ timeOfDay: null }), makeScheduledWorkout({ planEntryId: null })]),
      defaultSettings,
      now,
    );
    expect(reminders).toEqual([]);
  });

  test('skips a workout whose fire time has already passed', () => {
    const reminders = buildWorkoutReminders(
      byDate([
        makeScheduledWorkout({ planEntryId: 1, timeOfDay: '12:20' }),
        makeScheduledWorkout({ planEntryId: 2, timeOfDay: '12:30' }),
        makeScheduledWorkout({ planEntryId: 3, timeOfDay: '12:31' }),
      ]),
      defaultSettings,
      now,
    );
    expect(reminders.map((reminder) => reminder.identifier)).toEqual(['workout-reminder:2026-10-06:3']);
  });

  test('skips a workout that has no workout to open', () => {
    const reminders = buildWorkoutReminders(byDate([makeScheduledWorkout({ workoutId: null })]), defaultSettings, now);
    expect(reminders).toEqual([]);
  });

  test('schedules nothing when reminders are turned off', () => {
    const reminders = buildWorkoutReminders(
      byDate([makeScheduledWorkout()]),
      { ...defaultSettings, areWorkoutRemindersEnabled: false },
      now,
    );
    expect(reminders).toEqual([]);
  });

  test('keeps the same identifier when only the time changes', () => {
    const early = buildWorkoutReminders(byDate([makeScheduledWorkout({ timeOfDay: '15:00' })]), defaultSettings, now);
    const late = buildWorkoutReminders(byDate([makeScheduledWorkout({ timeOfDay: '19:00' })]), defaultSettings, now);
    expect(early[0].identifier).toBe(late[0].identifier);
  });

  test('gives each plan entry on a day its own identifier, ordered by fire time', () => {
    const reminders = buildWorkoutReminders(
      byDate([
        makeScheduledWorkout({ planEntryId: 5, timeOfDay: '19:00', name: 'Yoga' }),
        makeScheduledWorkout({ planEntryId: 6, timeOfDay: '14:00', name: 'Legs' }),
      ]),
      defaultSettings,
      now,
    );
    expect(reminders.map((reminder) => [reminder.identifier, reminder.body])).toEqual([
      ['workout-reminder:2026-10-06:6', "Legs at 14:00 — Nuggie's ready when you are!"],
      ['workout-reminder:2026-10-06:5', "Yoga at 19:00 — Nuggie's ready when you are!"],
    ]);
  });
});
