import { pickNewerHealthSnapshot } from '@/health/pickNewerHealthSnapshot';
import type { HealthSnapshot } from '@/types/HealthSnapshot';

export function mergeHealthSnapshots(
  existingSnapshotsByDate: ReadonlyMap<string, HealthSnapshot>,
  incomingSnapshots: readonly HealthSnapshot[],
): Map<string, HealthSnapshot> {
  const mergedSnapshotsByDate = new Map(existingSnapshotsByDate);
  for (const incomingSnapshot of incomingSnapshots) {
    const winningSnapshot = pickNewerHealthSnapshot(mergedSnapshotsByDate.get(incomingSnapshot.date), incomingSnapshot);
    if (winningSnapshot !== null) {
      mergedSnapshotsByDate.set(incomingSnapshot.date, winningSnapshot);
    }
  }
  return mergedSnapshotsByDate;
}
