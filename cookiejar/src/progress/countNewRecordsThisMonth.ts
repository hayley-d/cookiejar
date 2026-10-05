import { countPersonalRecordsInRange, type PersonalRecordListItem } from '@/progress/buildPersonalRecordList';
import { currentMonthRange } from '@/progress/currentMonthRange';

export function countNewRecordsThisMonth(
  personalRecords: readonly PersonalRecordListItem[] | null,
  now: Date,
): number | null {
  return personalRecords === null ? null : countPersonalRecordsInRange(personalRecords, currentMonthRange(now));
}
