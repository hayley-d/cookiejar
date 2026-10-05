import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import type { Insight } from '@/coach/Insight';
import { describePersonalRecordDetail } from '@/progress/describePersonalRecord';
import type { PersonalRecord } from '@/progress/detectPersonalRecords';
import type { Exercise } from '@/types/Exercise';

export const newPersonalRecordsPriority = 80;
export const maximumListedPersonalRecords = 3;

export function newPersonalRecords(snapshot: CoachSnapshot): Insight[] {
  const newestFirst = [...snapshot.personalRecordsLastFourteenDays].sort((first, second) =>
    second.startedAt.localeCompare(first.startedAt),
  );
  const seenExerciseIds = new Set<number>();
  const listedRecords: { exercise: Exercise; record: PersonalRecord }[] = [];
  for (const recordEvent of newestFirst) {
    const exerciseId = recordEvent.record.exerciseId;
    const exercise = snapshot.exercisesById.get(exerciseId);
    if (exercise === undefined || seenExerciseIds.has(exerciseId)) {
      continue;
    }
    seenExerciseIds.add(exerciseId);
    listedRecords.push({ exercise, record: recordEvent.record });
  }
  listedRecords.splice(maximumListedPersonalRecords);
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
