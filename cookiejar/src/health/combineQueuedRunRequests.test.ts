import { describe, expect, test } from 'bun:test';

import { combineQueuedRunRequests, type RunRequest } from '@/health/combineQueuedRunRequests';

function requestWith(isActive: boolean): RunRequest {
  return { isActive: () => isActive, execute: async () => {} };
}

describe('combineQueuedRunRequests', () => {
  test('returns the incoming request when nothing is queued', () => {
    const incoming = requestWith(true);
    expect(combineQueuedRunRequests(null, incoming)).toBe(incoming);
  });

  test('stays active when only the queued request is still active', () => {
    const combined = combineQueuedRunRequests(requestWith(true), requestWith(false));
    expect(combined.isActive()).toBe(true);
  });

  test('stays active when only the incoming request is still active', () => {
    const combined = combineQueuedRunRequests(requestWith(false), requestWith(true));
    expect(combined.isActive()).toBe(true);
  });

  test('is inactive when neither request is active', () => {
    const combined = combineQueuedRunRequests(requestWith(false), requestWith(false));
    expect(combined.isActive()).toBe(false);
  });

  test('executes with the incoming request', () => {
    const incoming = requestWith(true);
    expect(combineQueuedRunRequests(requestWith(true), incoming).execute).toBe(incoming.execute);
  });
});
