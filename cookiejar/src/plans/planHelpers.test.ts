import { describe, expect, test } from 'bun:test';

import { describePlanEntryWorkout } from '@/plans/describePlanEntryWorkout';
import { describePlanSummary } from '@/plans/describePlanSummary';
import { groupEntriesByWeekday } from '@/plans/groupEntriesByWeekday';
import { planNameError } from '@/plans/planNameError';
import { weekdayName } from '@/plans/weekdays';

describe('describePlanSummary', () => {
  test('a plan without entries says so', () => {
    expect(describePlanSummary(0)).toBe('No workouts yet');
  });

  test('one entry is singular', () => {
    expect(describePlanSummary(1)).toBe('1 workout / week');
  });

  test('counts every entry in the week', () => {
    expect(describePlanSummary(2)).toBe('2 workouts / week');
    expect(describePlanSummary(5)).toBe('5 workouts / week');
  });
});

describe('planNameError', () => {
  test('a name is required', () => {
    expect(planNameError('')).toBe('Give your plan a name');
  });

  test('a name of only spaces is treated as empty', () => {
    expect(planNameError('   ')).toBe('Give your plan a name');
  });

  test('any other name is fine', () => {
    expect(planNameError(' Summer Strength ')).toBeNull();
  });
});

describe('weekdayName', () => {
  test('1 is Monday and 7 is Sunday', () => {
    expect(weekdayName(1)).toBe('Monday');
    expect(weekdayName(7)).toBe('Sunday');
  });

  test('rejects numbers outside the week', () => {
    expect(() => weekdayName(0)).toThrow();
    expect(() => weekdayName(8)).toThrow();
  });
});

describe('groupEntriesByWeekday', () => {
  test('always returns Monday to Sunday, empty days included', () => {
    const days = groupEntriesByWeekday([]);
    expect(days.map((day) => day.name)).toEqual([
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]);
    expect(days.every((day) => day.entries.length === 0)).toBe(true);
  });

  test('puts each entry on its day in time order', () => {
    const days = groupEntriesByWeekday([
      { id: 1, dayOfWeek: 1, timeOfDay: '17:30' },
      { id: 2, dayOfWeek: 1, timeOfDay: '06:00' },
      { id: 3, dayOfWeek: 7, timeOfDay: '09:00' },
    ]);
    expect(days[0].entries.map((entry) => entry.id)).toEqual([2, 1]);
    expect(days[1].entries).toEqual([]);
    expect(days[6].entries.map((entry) => entry.id)).toEqual([3]);
  });
});

describe('describePlanEntryWorkout', () => {
  test('a class shows its class type', () => {
    expect(describePlanEntryWorkout({ kind: 'class', classType: 'spin', exerciseCount: 0 })).toBe('Spin');
  });

  test('a class without a type shows Class', () => {
    expect(describePlanEntryWorkout({ kind: 'class', classType: null, exerciseCount: 0 })).toBe('Class');
  });

  test('an individual workout shows its exercise count', () => {
    expect(describePlanEntryWorkout({ kind: 'individual', classType: null, exerciseCount: 6 })).toBe('6 ex.');
  });
});
