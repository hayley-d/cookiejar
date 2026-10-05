import { toLocalDateString } from '@/dates/toLocalDateString';
import { buildPersonalRecordList } from '@/progress/buildPersonalRecordList';
import type { ExerciseSeriesSet } from '@/progress/buildExerciseSeries';
import { describePreviousSet } from '@/sessions/describePreviousSet';
import type { ExerciseHistorySet } from '@/types/ExerciseHistory';

export type ExerciseSessionSet = {
  setId: number;
  description: string;
  isRecord: boolean;
};

export type ExerciseSession = {
  sessionId: number;
  date: string;
  workoutName: string;
  sets: ExerciseSessionSet[];
};

export type ExerciseHistory = {
  sessions: ExerciseSession[];
  recordSetIds: Set<number>;
  recordDates: string[];
  seriesSets: ExerciseSeriesSet[];
};

export function buildExerciseHistory(historySets: readonly ExerciseHistorySet[]): ExerciseHistory {
  const recordItems = buildPersonalRecordList(historySets);
  const recordedSets = new Set(recordItems.map((item) => item.record.set));
  const recordSetIds = new Set(
    historySets.filter((historySet) => recordedSets.has(historySet.set)).map((historySet) => historySet.setId),
  );
  const recordDates = [...new Set(recordItems.map((item) => item.startedDate))];

  const sessionsById = new Map<number, ExerciseSession>();
  for (const historySet of historySets) {
    let session = sessionsById.get(historySet.sessionId);
    if (session === undefined) {
      session = {
        sessionId: historySet.sessionId,
        date: toLocalDateString(new Date(historySet.startedAt)),
        workoutName: historySet.workoutName,
        sets: [],
      };
      sessionsById.set(historySet.sessionId, session);
    }
    session.sets.push({
      setId: historySet.setId,
      description: describePreviousSet(historySet.set.trackingType, historySet.set),
      isRecord: recordSetIds.has(historySet.setId),
    });
  }

  return {
    sessions: [...sessionsById.values()].reverse(),
    recordSetIds,
    recordDates,
    seriesSets: historySets.map((historySet) => ({
      sessionId: historySet.sessionId,
      date: toLocalDateString(new Date(historySet.startedAt)),
      set: historySet.set,
    })),
  };
}
