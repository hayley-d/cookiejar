import { describe, expect, test } from 'bun:test';

import { calculateWeeklyStreak, isWeeklyTargetMet } from '@/progress/calculateWeeklyStreak';
import type { ScheduledWorkout, ScheduledWorkoutStatus } from '@/types/ScheduledWorkout';

const weekDates = ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11'];

function workoutOf(date: string, status: ScheduledWorkoutStatus, planEntryId: number | null): ScheduledWorkout {
  return {
    date,
    timeOfDay: null,
    planEntryId,
    status,
    sessionId: null,
    workout: {
      id: 1,
      name: 'Workout',
      kind: 'individual',
      classType: null,
      durationMinutes: null,
      imageUrl: null,
      exerciseCount: 0,
      targetSetCount: 0,
      targetRestSeconds: 0,
    },
  };
}

function byDateOf(...scheduledWorkouts: ScheduledWorkout[]): Map<string, ScheduledWorkout[]> {
  const scheduledWorkoutsByDate = new Map<string, ScheduledWorkout[]>();
  for (const scheduledWorkout of scheduledWorkouts) {
    scheduledWorkoutsByDate.set(scheduledWorkout.date, [
      ...(scheduledWorkoutsByDate.get(scheduledWorkout.date) ?? []),
      scheduledWorkout,
    ]);
  }
  return scheduledWorkoutsByDate;
}

function statesOf(streak: ReturnType<typeof calculateWeeklyStreak>) {
  return streak.days.map((day) => day.state);
}

describe('calculateWeeklyStreak', () => {
  test('an empty week is seven rest days with zero counts', () => {
    const streak = calculateWeeklyStreak({ today: '2026-10-07', weekDates, scheduledWorkoutsByDate: new Map() });
    expect(streak.completedCount).toBe(0);
    expect(streak.plannedCount).toBe(0);
    expect(streak.days.map((day) => day.date)).toEqual(weekDates);
    expect(statesOf(streak)).toEqual(Array(7).fill('rest'));
  });

  test('all planned workouts completed', () => {
    const scheduledWorkoutsByDate = byDateOf(
      workoutOf('2026-10-05', 'completed', 1),
      workoutOf('2026-10-07', 'completed', 2),
      workoutOf('2026-10-09', 'completed', 3),
    );
    const streak = calculateWeeklyStreak({ today: '2026-10-09', weekDates, scheduledWorkoutsByDate });
    expect(streak.completedCount).toBe(3);
    expect(streak.plannedCount).toBe(3);
    expect(statesOf(streak)).toEqual(['completed', 'rest', 'completed', 'rest', 'completed', 'rest', 'rest']);
  });

  test('past planned days that were not done are missed', () => {
    const scheduledWorkoutsByDate = byDateOf(
      workoutOf('2026-10-05', 'planned', 1),
      workoutOf('2026-10-06', 'completed', 2),
    );
    const streak = calculateWeeklyStreak({ today: '2026-10-08', weekDates, scheduledWorkoutsByDate });
    expect(streak.completedCount).toBe(1);
    expect(streak.plannedCount).toBe(2);
    expect(statesOf(streak).slice(0, 2)).toEqual(['missed', 'completed']);
  });

  test('completed unplanned sessions add to both counts and show as unplanned', () => {
    const scheduledWorkoutsByDate = byDateOf(
      workoutOf('2026-10-05', 'completed', 1),
      workoutOf('2026-10-06', 'completed', null),
    );
    const streak = calculateWeeklyStreak({ today: '2026-10-07', weekDates, scheduledWorkoutsByDate });
    expect(streak.completedCount).toBe(2);
    expect(streak.plannedCount).toBe(2);
    expect(statesOf(streak).slice(0, 2)).toEqual(['completed', 'unplanned']);
  });

  test('a day with only completed unplanned workouts is unplanned', () => {
    const scheduledWorkoutsByDate = byDateOf(workoutOf('2026-10-06', 'completed', null));
    const streak = calculateWeeklyStreak({ today: '2026-10-07', weekDates, scheduledWorkoutsByDate });
    expect(streak.days[1].state).toBe('unplanned');
  });

  test('today with a planned workout is pending and future days are pending', () => {
    const scheduledWorkoutsByDate = byDateOf(
      workoutOf('2026-10-07', 'planned', 1),
      workoutOf('2026-10-09', 'planned', 2),
    );
    const streak = calculateWeeklyStreak({ today: '2026-10-07', weekDates, scheduledWorkoutsByDate });
    expect(streak.completedCount).toBe(0);
    expect(streak.plannedCount).toBe(2);
    expect(streak.days[2].state).toBe('pending');
    expect(streak.days[4].state).toBe('pending');
  });

  test('an unplanned in-progress session counts in neither total and is pending today', () => {
    const scheduledWorkoutsByDate = byDateOf(workoutOf('2026-10-07', 'inProgress', null));
    const streak = calculateWeeklyStreak({ today: '2026-10-07', weekDates, scheduledWorkoutsByDate });
    expect(streak.completedCount).toBe(0);
    expect(streak.plannedCount).toBe(0);
    expect(streak.days[2].state).toBe('pending');
  });

  test('a planned in-progress session counts as planned but not completed', () => {
    const scheduledWorkoutsByDate = byDateOf(workoutOf('2026-10-07', 'inProgress', 4));
    const streak = calculateWeeklyStreak({ today: '2026-10-07', weekDates, scheduledWorkoutsByDate });
    expect(streak.completedCount).toBe(0);
    expect(streak.plannedCount).toBe(1);
    expect(streak.days[2].state).toBe('pending');
  });

  test('a past day with one completed and one missed workout is missed', () => {
    const scheduledWorkoutsByDate = byDateOf(
      workoutOf('2026-10-05', 'completed', 1),
      workoutOf('2026-10-05', 'planned', 2),
    );
    const streak = calculateWeeklyStreak({ today: '2026-10-07', weekDates, scheduledWorkoutsByDate });
    expect(streak.completedCount).toBe(1);
    expect(streak.plannedCount).toBe(2);
    expect(streak.days[0].state).toBe('missed');
  });

  test('today with one completed and one planned workout is pending', () => {
    const scheduledWorkoutsByDate = byDateOf(
      workoutOf('2026-10-07', 'completed', 1),
      workoutOf('2026-10-07', 'planned', 2),
    );
    const streak = calculateWeeklyStreak({ today: '2026-10-07', weekDates, scheduledWorkoutsByDate });
    expect(streak.days[2].state).toBe('pending');
  });
});

describe('isWeeklyTargetMet', () => {
  test('is met when completed reaches the weekly target', () => {
    expect(isWeeklyTargetMet({ completedCount: 4, plannedCount: 6 }, 4)).toBe(true);
  });

  test('is met when everything planned is completed even below the target', () => {
    expect(isWeeklyTargetMet({ completedCount: 3, plannedCount: 3 }, 5)).toBe(true);
  });

  test('is not met below both thresholds', () => {
    expect(isWeeklyTargetMet({ completedCount: 3, plannedCount: 5 }, 4)).toBe(false);
  });

  test('an empty week is not met by the planned rule', () => {
    expect(isWeeklyTargetMet({ completedCount: 0, plannedCount: 0 }, 4)).toBe(false);
  });
});
