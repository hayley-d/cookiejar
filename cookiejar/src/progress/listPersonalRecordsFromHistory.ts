import {
  detectPersonalRecords,
  selectBestRecordPerExercise,
  type CompletedSet,
  type PersonalRecord,
} from '@/progress/detectPersonalRecords';

export type HistorySession = {
  sessionId: number;
  startedAt: string;
  sets: readonly CompletedSet[];
};

export type PersonalRecordEvent = {
  sessionId: number;
  startedAt: string;
  record: PersonalRecord;
};

export function listPersonalRecordsFromHistory(sessionsInOrder: readonly HistorySession[]): PersonalRecordEvent[] {
  const eventsBySession: PersonalRecordEvent[][] = [];
  const earlierSets: CompletedSet[] = [];
  let groupStart = 0;

  while (groupStart < sessionsInOrder.length) {
    let groupEnd = groupStart;
    while (
      groupEnd < sessionsInOrder.length &&
      sessionsInOrder[groupEnd].startedAt === sessionsInOrder[groupStart].startedAt
    ) {
      groupEnd += 1;
    }
    const sessionsStartingTogether = sessionsInOrder.slice(groupStart, groupEnd);
    for (const session of sessionsStartingTogether) {
      eventsBySession.push(
        selectBestRecordPerExercise(detectPersonalRecords(session.sets, earlierSets)).map((record) => ({
          sessionId: session.sessionId,
          startedAt: session.startedAt,
          record,
        })),
      );
    }
    for (const session of sessionsStartingTogether) {
      earlierSets.push(...session.sets);
    }
    groupStart = groupEnd;
  }

  return eventsBySession.reverse().flat();
}
