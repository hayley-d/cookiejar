import { describe, expect, test } from 'bun:test';

import { resolveSessionStart } from '@/sessions/resolveSessionStart';

describe('resolveSessionStart', () => {
  test('a plan entry with no session on the date creates one linked to the entry', () => {
    expect(resolveSessionStart(7, [])).toEqual({ kind: 'create', planEntryId: 7 });
  });

  test('an unfinished session for the entry on the date is resumed', () => {
    expect(resolveSessionStart(7, [{ id: 3, finishedAt: null }])).toEqual({ kind: 'resume', sessionId: 3 });
  });

  test('an unfinished session is resumed even when a finished one also exists', () => {
    expect(
      resolveSessionStart(7, [
        { id: 3, finishedAt: '2026-10-05T08:00:00Z' },
        { id: 4, finishedAt: null },
      ]),
    ).toEqual({ kind: 'resume', sessionId: 4 });
  });

  test('a finished session for the entry on the date makes a redo with no plan entry', () => {
    expect(resolveSessionStart(7, [{ id: 3, finishedAt: '2026-10-05T08:00:00Z' }])).toEqual({
      kind: 'create',
      planEntryId: null,
    });
  });

  test('a start without a plan entry always creates an unplanned session', () => {
    expect(resolveSessionStart(null, [{ id: 3, finishedAt: null }])).toEqual({ kind: 'create', planEntryId: null });
  });
});
