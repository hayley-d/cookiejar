import { toLocalDateString } from '@/dates/toLocalDateString';
import type { CompletedSet, PersonalRecord } from '@/progress/detectPersonalRecords';
import { listPersonalRecordsFromHistory, type HistorySession } from '@/progress/listPersonalRecordsFromHistory';
import type { FinishedSessionSet } from '@/types/FinishedSessionSet';
import type { TrainingTotalsRange } from '@/types/TrainingTotals';

export type PersonalRecordListItem = {
  key: string;
  sessionId: number;
  workoutName: string;
  startedDate: string;
  exerciseName: string;
  exerciseImageUrl: string | null;
  record: PersonalRecord;
};

export function buildPersonalRecordList(finishedSessionSets: readonly FinishedSessionSet[]): PersonalRecordListItem[] {
  const sessionsInOrder: HistorySession[] = [];
  const workoutNames = new Map<number, string>();
  const exerciseDetails = new Map<number, { name: string; imageUrl: string | null }>();
  const mutableSetsBySession = new Map<number, CompletedSet[]>();

  for (const finishedSessionSet of finishedSessionSets) {
    let sessionSets = mutableSetsBySession.get(finishedSessionSet.sessionId);
    if (sessionSets === undefined) {
      sessionSets = [];
      mutableSetsBySession.set(finishedSessionSet.sessionId, sessionSets);
      workoutNames.set(finishedSessionSet.sessionId, finishedSessionSet.workoutName);
      sessionsInOrder.push({
        sessionId: finishedSessionSet.sessionId,
        startedAt: finishedSessionSet.startedAt,
        sets: sessionSets,
      });
    }
    sessionSets.push(finishedSessionSet.set);
    exerciseDetails.set(finishedSessionSet.set.exerciseId, {
      name: finishedSessionSet.exerciseName,
      imageUrl: finishedSessionSet.exerciseImageUrl,
    });
  }

  return listPersonalRecordsFromHistory(sessionsInOrder).map((event) => {
    const details = exerciseDetails.get(event.record.exerciseId);
    return {
      key: `${event.sessionId}-${event.record.exerciseId}`,
      sessionId: event.sessionId,
      workoutName: workoutNames.get(event.sessionId) ?? '',
      startedDate: toLocalDateString(new Date(event.startedAt)),
      exerciseName: details?.name ?? 'Exercise',
      exerciseImageUrl: details?.imageUrl ?? null,
      record: event.record,
    };
  });
}

export function countPersonalRecordsInRange(
  items: readonly PersonalRecordListItem[],
  range: TrainingTotalsRange,
): number {
  return items.filter(
    (item) => (range.startDate === null || item.startedDate >= range.startDate) && item.startedDate <= range.endDate,
  ).length;
}
