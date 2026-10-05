import { describe, expect, test } from 'bun:test';

import { countNewRecordsThisMonth } from '@/progress/countNewRecordsThisMonth';
import type { PersonalRecordListItem } from '@/progress/buildPersonalRecordList';

function recordOn(startedDate: string) {
  return { startedDate } as PersonalRecordListItem;
}

describe('countNewRecordsThisMonth', () => {
  test('is null while the records are not loaded', () => {
    expect(countNewRecordsThisMonth(null, new Date(2026, 9, 5))).toBeNull();
  });

  test('counts only records in the current month', () => {
    const records = [recordOn('2026-10-04'), recordOn('2026-10-01'), recordOn('2026-09-30')];
    expect(countNewRecordsThisMonth(records, new Date(2026, 9, 5))).toBe(2);
  });

  test('is zero for loaded records with none this month', () => {
    expect(countNewRecordsThisMonth([], new Date(2026, 9, 5))).toBe(0);
  });
});
