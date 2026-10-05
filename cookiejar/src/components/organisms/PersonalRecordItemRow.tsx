import { PersonalRecordRow } from '@/components/molecules/PersonalRecordRow';
import { formatShortDate } from '@/dates/formatShortDate';
import type { PersonalRecordListItem } from '@/progress/buildPersonalRecordList';
import { describePersonalRecordDetail } from '@/progress/describePersonalRecord';
import { describePersonalRecordType } from '@/progress/describePersonalRecordType';

type PersonalRecordItemRowProperties = {
  item: PersonalRecordListItem;
  onPress: (sessionId: number) => void;
};

export function PersonalRecordItemRow({ item, onPress }: PersonalRecordItemRowProperties) {
  return (
    <PersonalRecordRow
      exerciseName={item.exerciseName}
      detail={describePersonalRecordDetail(item.record)}
      imageUrl={item.exerciseImageUrl}
      recordTypeLabel={describePersonalRecordType(item.record.recordType)}
      dateLabel={formatShortDate(item.startedDate)}
      sessionName={item.workoutName}
      onPress={() => onPress(item.sessionId)}
    />
  );
}
