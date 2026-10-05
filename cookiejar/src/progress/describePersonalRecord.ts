import { formatTargetSetValue } from '@/workouts/describeTargetSets';
import { estimateOneRepMax, type PersonalRecord } from '@/progress/detectPersonalRecords';

export function describePersonalRecordDetail(record: PersonalRecord): string {
  const { set } = record;
  switch (record.recordType) {
    case 'heaviestWeight':
    case 'bestEstimatedOneRepMax':
    case 'mostRepetitionsAtWeight': {
      const detail = `${formatTargetSetValue('weightKilograms', set)} kg × ${set.repetitions}`;
      if (set.weightKilograms === null || set.repetitions === null) {
        return detail;
      }
      return `${detail} (est. 1RM ${Math.round(estimateOneRepMax(set.weightKilograms, set.repetitions))} kg)`;
    }
    case 'mostRepetitions':
      return `${formatTargetSetValue('repetitions', set)} ${set.repetitions === 1 ? 'rep' : 'reps'}`;
    case 'longestDuration':
      return formatTargetSetValue('durationSeconds', set);
    case 'longestDistance':
      return formatTargetSetValue('distanceMeters', set);
  }
}
