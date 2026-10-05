import type { HealthSnapshot } from '@/types/HealthSnapshot';

export function mergeHealthSnapshots(
  existingSnapshotsByDate: ReadonlyMap<string, HealthSnapshot>,
  incomingSnapshots: readonly HealthSnapshot[],
): Map<string, HealthSnapshot> {
  const mergedSnapshotsByDate = new Map(existingSnapshotsByDate);
  for (const incomingSnapshot of incomingSnapshots) {
    const existingSnapshot = mergedSnapshotsByDate.get(incomingSnapshot.date);
    const isIncomingNewer =
      existingSnapshot === undefined ||
      new Date(incomingSnapshot.fetchedAt).getTime() >= new Date(existingSnapshot.fetchedAt).getTime();
    if (isIncomingNewer) {
      mergedSnapshotsByDate.set(incomingSnapshot.date, incomingSnapshot);
    }
  }
  return mergedSnapshotsByDate;
}
