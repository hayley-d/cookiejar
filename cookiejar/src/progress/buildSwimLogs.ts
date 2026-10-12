import { swumDistanceByStroke, type SwimStrokeDistance } from '@/swimming/swimSessionTotals';
import type { SwimLog } from '@/types/SwimLog';

export type SwimTickedSetRow = {
  sessionId: number;
  startedAt: string;
  durationSeconds: number;
  strokeName: string | null;
  setDistanceMeters: number | null;
  tickedRepetitionCount: number;
};

export function buildSwimLogs(rows: readonly SwimTickedSetRow[]): SwimLog[] {
  const rowsBySessionId = new Map<number, SwimTickedSetRow[]>();
  for (const row of rows) {
    rowsBySessionId.set(row.sessionId, [...(rowsBySessionId.get(row.sessionId) ?? []), row]);
  }
  return [...rowsBySessionId.values()].map((sessionRows) => {
    const repetitions = sessionRows.flatMap((row) => {
      const { strokeName, setDistanceMeters } = row;
      if (strokeName === null || setDistanceMeters === null) {
        return [];
      }
      return Array.from({ length: row.tickedRepetitionCount }, () => ({
        strokeName,
        distanceMeters: setDistanceMeters,
        isCompleted: true,
      }));
    });
    const strokeDistances: SwimStrokeDistance[] = swumDistanceByStroke(repetitions);
    return {
      startedAt: sessionRows[0].startedAt,
      durationSeconds: sessionRows[0].durationSeconds,
      distanceMeters: strokeDistances.reduce((total, strokeDistance) => total + strokeDistance.distanceMeters, 0),
      strokeDistances,
    };
  });
}
