import { countPersonalRecordsInRange } from '@/progress/buildPersonalRecordList';
import { currentMonthRange } from '@/progress/currentMonthRange';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';

export function useNewRecordCount(): number {
  const { personalRecords } = usePersonalRecords();
  return personalRecords === null ? 0 : countPersonalRecordsInRange(personalRecords, currentMonthRange(new Date()));
}
