import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import type { Insight } from '@/coach/Insight';
import { describePersonalRecordDetail } from '@/progress/describePersonalRecord';

export const newPersonalRecordsPriority = 80;
export const maximumListedPersonalRecords = 3;

export function newPersonalRecords(snapshot: CoachSnapshot): Insight[] {
  const listedRecords = [...snapshot.personalRecordsLastFourteenDays]
    .sort((first, second) => (first.startedAt < second.startedAt ? 1 : first.startedAt > second.startedAt ? -1 : 0))
    .flatMap((recordEvent) => {
      const exercise = snapshot.exercisesById.get(recordEvent.record.exerciseId);
      return exercise === undefined ? [] : [{ exercise, record: recordEvent.record }];
    })
    .slice(0, maximumListedPersonalRecords);
  if (listedRecords.length === 0) {
    return [];
  }
  return [
    {
      ruleIdentifier: 'newPersonalRecords',
      topics: ['progress'],
      priority: newPersonalRecordsPriority,
      nuggie: 'beast',
      messages: listedRecords.map(
        ({ exercise, record }) => `New record on ${exercise.name} — ${describePersonalRecordDetail(record)}!`,
      ),
      action: {
        label: `See ${listedRecords[0].exercise.name} history`,
        destination: {
          screen: 'exerciseHistory',
          exerciseId: listedRecords[0].exercise.id,
        },
      },
    },
  ];
}
