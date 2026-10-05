import { describe, expect, test } from 'bun:test';

import { planCopyDay } from '@/plans/planCopyDay';

const morningSpin = { workoutId: 1, timeOfDay: '06:00' };
const eveningYoga = { workoutId: 2, timeOfDay: '17:30' };

describe('planCopyDay', () => {
  test('copies every source entry onto each empty target day', () => {
    const plannedInserts = planCopyDay([morningSpin, eveningYoga], 1, [
      { dayOfWeek: 3, existingEntries: [] },
      { dayOfWeek: 5, existingEntries: [] },
    ]);

    expect(plannedInserts).toEqual([
      { dayOfWeek: 3, ...morningSpin },
      { dayOfWeek: 3, ...eveningYoga },
      { dayOfWeek: 5, ...morningSpin },
      { dayOfWeek: 5, ...eveningYoga },
    ]);
  });

  test('an empty source day plans nothing', () => {
    expect(planCopyDay([], 1, [{ dayOfWeek: 3, existingEntries: [] }])).toEqual([]);
  });

  test('skips an entry when the target day already has the same workout at the same time', () => {
    const plannedInserts = planCopyDay([morningSpin, eveningYoga], 1, [
      { dayOfWeek: 3, existingEntries: [morningSpin] },
    ]);

    expect(plannedInserts).toEqual([{ dayOfWeek: 3, ...eveningYoga }]);
  });

  test('copying again plans nothing', () => {
    const plannedInserts = planCopyDay([morningSpin, eveningYoga], 1, [
      { dayOfWeek: 3, existingEntries: [morningSpin, eveningYoga] },
    ]);

    expect(plannedInserts).toEqual([]);
  });

  test('keeps the same workout at a different time or a different workout at the same time', () => {
    const plannedInserts = planCopyDay([morningSpin], 1, [
      {
        dayOfWeek: 3,
        existingEntries: [
          { workoutId: 1, timeOfDay: '07:00' },
          { workoutId: 9, timeOfDay: '06:00' },
        ],
      },
    ]);

    expect(plannedInserts).toEqual([{ dayOfWeek: 3, ...morningSpin }]);
  });

  test('does not insert the same workout and time twice from duplicated source entries', () => {
    const plannedInserts = planCopyDay([morningSpin, morningSpin], 1, [{ dayOfWeek: 3, existingEntries: [] }]);

    expect(plannedInserts).toEqual([{ dayOfWeek: 3, ...morningSpin }]);
  });

  test('ignores the source day and repeated target days', () => {
    const plannedInserts = planCopyDay([morningSpin], 1, [
      { dayOfWeek: 1, existingEntries: [morningSpin] },
      { dayOfWeek: 3, existingEntries: [] },
      { dayOfWeek: 3, existingEntries: [] },
    ]);

    expect(plannedInserts).toEqual([{ dayOfWeek: 3, ...morningSpin }]);
  });
});
