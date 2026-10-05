import type { ActiveSession } from '@/types/ActiveSession';

export type SessionStartRequestDetails = {
  workoutId: number;
  scheduledDate: string;
  planEntryId: number | null;
};

export type StartAgainstActiveSession =
  | { kind: 'start' }
  | { kind: 'resume'; sessionId: number }
  | { kind: 'prompt'; sessionId: number; workoutName: string };

export function isRequestForActiveSession(
  request: SessionStartRequestDetails,
  activeSession: ActiveSession,
): boolean {
  return (
    activeSession.workoutId === request.workoutId &&
    activeSession.scheduledDate === request.scheduledDate &&
    activeSession.planEntryId === request.planEntryId
  );
}

export function resolveStartAgainstActiveSession(
  request: SessionStartRequestDetails,
  activeSession: ActiveSession | null,
): StartAgainstActiveSession {
  if (activeSession === null) {
    return { kind: 'start' };
  }
  if (isRequestForActiveSession(request, activeSession)) {
    return { kind: 'resume', sessionId: activeSession.id };
  }
  return { kind: 'prompt', sessionId: activeSession.id, workoutName: activeSession.workoutName };
}

export function describeSingleSessionPromptTitle(workoutName: string): string {
  return `Finish or discard ${workoutName} first?`;
}
