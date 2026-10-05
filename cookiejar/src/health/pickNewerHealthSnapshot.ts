import type { HealthSnapshot } from '@/types/HealthSnapshot';

export function pickNewerHealthSnapshot(
  existingSnapshot: HealthSnapshot | null | undefined,
  incomingSnapshot: HealthSnapshot | null,
): HealthSnapshot | null {
  if (incomingSnapshot === null) {
    return existingSnapshot ?? null;
  }
  if (existingSnapshot === null || existingSnapshot === undefined) {
    return incomingSnapshot;
  }
  const incomingFetchedAtTime = new Date(incomingSnapshot.fetchedAt).getTime();
  const isIncomingNewer = incomingFetchedAtTime >= new Date(existingSnapshot.fetchedAt).getTime();
  return isIncomingNewer ? incomingSnapshot : existingSnapshot;
}
