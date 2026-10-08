import type { PersonalRecordType } from '@/progress/detectPersonalRecords';

const recordTypeLabels: Record<PersonalRecordType, string> = {
  heaviestWeight: 'Heaviest weight',
  bestEstimatedOneRepMax: 'Best estimated 1RM',
  mostRepetitionsAtWeight: 'Most reps at weight',
  leastAssistance: 'Least assistance',
  mostRepetitionsAtAssistance: 'Most reps at assistance',
  mostRepetitions: 'Most reps',
  longestDuration: 'Longest time',
  longestDistance: 'Longest distance',
};

export function describePersonalRecordType(recordType: PersonalRecordType): string {
  return recordTypeLabels[recordType];
}
