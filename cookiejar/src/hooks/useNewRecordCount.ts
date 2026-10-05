import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { countNewRecordsThisMonth } from '@/progress/countNewRecordsThisMonth';

export function useNewRecordCount(): number | null {
  const { personalRecords } = usePersonalRecords();
  return countNewRecordsThisMonth(personalRecords, new Date());
}
