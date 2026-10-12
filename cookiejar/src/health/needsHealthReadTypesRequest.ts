export function needsHealthReadTypesRequest(
  requestedAt: string | null,
  storedReadTypesVersion: string | null,
  currentReadTypesVersion: number,
): boolean {
  if (requestedAt === null) {
    return false;
  }
  return storedReadTypesVersion !== String(currentReadTypesVersion);
}
