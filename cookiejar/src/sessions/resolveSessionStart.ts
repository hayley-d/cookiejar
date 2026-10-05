export type ExistingPlanEntrySession = {
  id: number;
  finishedAt: string | null;
};

export type SessionStart = { kind: 'resume'; sessionId: number } | { kind: 'create'; planEntryId: number | null };

export function resolveSessionStart(
  planEntryId: number | null,
  sessionsForPlanEntryOnDate: readonly ExistingPlanEntrySession[],
): SessionStart {
  if (planEntryId === null) {
    return { kind: 'create', planEntryId: null };
  }
  const unfinishedSession = sessionsForPlanEntryOnDate.find((session) => session.finishedAt === null);
  if (unfinishedSession !== undefined) {
    return { kind: 'resume', sessionId: unfinishedSession.id };
  }
  if (sessionsForPlanEntryOnDate.length > 0) {
    return { kind: 'create', planEntryId: null };
  }
  return { kind: 'create', planEntryId };
}
