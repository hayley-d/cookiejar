import { describe, expect, test } from 'bun:test';

import {
  describeSingleSessionPromptTitle,
  resolveStartAgainstActiveSession,
} from '@/sessions/resolveStartAgainstActiveSession';
import type { ActiveSession } from '@/types/ActiveSession';

const activeSession: ActiveSession = {
  id: 12,
  workoutId: 3,
  planEntryId: 7,
  workoutName: 'Push Day',
  scheduledDate: '2026-10-05',
  startedAt: '2026-10-05T08:00:00Z',
};

describe('resolveStartAgainstActiveSession', () => {
  test('starts when nothing is open', () => {
    expect(resolveStartAgainstActiveSession({ workoutId: 3, scheduledDate: '2026-10-05', planEntryId: 7 }, null)).toEqual(
      { kind: 'start' },
    );
  });

  test('resumes when the request is for the same date, plan entry and workout', () => {
    expect(
      resolveStartAgainstActiveSession({ workoutId: 3, scheduledDate: '2026-10-05', planEntryId: 7 }, activeSession),
    ).toEqual({ kind: 'resume', sessionId: 12 });
  });

  test('resumes an unplanned session started again for the same workout and date', () => {
    const unplannedSession = { ...activeSession, planEntryId: null };
    expect(
      resolveStartAgainstActiveSession({ workoutId: 3, scheduledDate: '2026-10-05', planEntryId: null }, unplannedSession),
    ).toEqual({ kind: 'resume', sessionId: 12 });
  });

  test('prompts with the open session name for a different workout', () => {
    expect(
      resolveStartAgainstActiveSession({ workoutId: 4, scheduledDate: '2026-10-05', planEntryId: null }, activeSession),
    ).toEqual({ kind: 'prompt', sessionId: 12, workoutName: 'Push Day' });
  });

  test('prompts for the same workout on another date', () => {
    expect(
      resolveStartAgainstActiveSession({ workoutId: 3, scheduledDate: '2026-10-06', planEntryId: 7 }, activeSession).kind,
    ).toBe('prompt');
  });

  test('prompts for the same workout on another plan entry', () => {
    expect(
      resolveStartAgainstActiveSession({ workoutId: 3, scheduledDate: '2026-10-05', planEntryId: 8 }, activeSession).kind,
    ).toBe('prompt');
  });

  test('prompts when the open session workout was deleted', () => {
    expect(
      resolveStartAgainstActiveSession(
        { workoutId: 3, scheduledDate: '2026-10-05', planEntryId: 7 },
        { ...activeSession, workoutId: null },
      ).kind,
    ).toBe('prompt');
  });
});

describe('describeSingleSessionPromptTitle', () => {
  test('names the open workout', () => {
    expect(describeSingleSessionPromptTitle('Push Day')).toBe('Finish or discard Push Day first?');
  });
});
