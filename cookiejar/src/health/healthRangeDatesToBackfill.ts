import { isHealthSnapshotFinal } from '@/health/isHealthSnapshotFinal';
import type { HealthSnapshot } from '@/types/HealthSnapshot';

export function healthRangeDatesToBackfill(
  dates: readonly string[],
  snapshots: readonly HealthSnapshot[],
  now: Date,
): string[] {
  const snapshotsByDate = new Map(snapshots.map((snapshot) => [snapshot.date, snapshot]));
  return dates.filter((date) => {
    const snapshot = snapshotsByDate.get(date);
    return snapshot === undefined || !isHealthSnapshotFinal(snapshot, now);
  });
}
